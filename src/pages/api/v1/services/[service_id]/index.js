import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { prisma as db } from "@/infra/prisma.js";

import { NotFoundError, ValidationError } from "@/infra/errors";
import authentication from "@/infra/authentication.js";
import authorization from "@/infra/authorization.js";

const router = createRouter();

router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

// ---------------------------------------------------------------------------
// Select block
// ---------------------------------------------------------------------------

const serviceSelect = {
  serviceId: true,
  serviceName: true,
  serviceDescription: true,
  duration: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// ---------------------------------------------------------------------------
// Response mapper
// ---------------------------------------------------------------------------

function mapServiceResponse(service) {
  return {
    service_id: service.serviceId,
    service_name: service.serviceName,
    service_description: service.serviceDescription,
    duration: service.duration,
    price: Number(service.price).toFixed(2),
    is_active: service.isActive,
    created_at: service.createdAt.toISOString(),
    updated_at: service.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function deleteHandler(request, response) {
  const { user } =
    await authentication.getAuthenticatedUserFromRequest(request);
  authorization.ensureAdmin(user);

  const serviceId = extractServiceId(request);

  const service = await db.service.findUnique({
    where: { serviceId },
    select: serviceSelect,
  });

  if (!service) {
    throw new NotFoundError({
      message: "Service not found.",
      action: "Verify if the service_id is correct.",
    });
  }

  // Idempotent: already inactive — return current data without writing
  if (!service.isActive) {
    return response.status(200).json(mapServiceResponse(service));
  }

  const updatedService = await db.service.update({
    where: { serviceId },
    data: { isActive: false },
    select: serviceSelect,
  });

  return response.status(200).json(mapServiceResponse(updatedService));
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function extractServiceId(request) {
  const rawServiceId = request.query.service_id;
  const serviceId = Array.isArray(rawServiceId)
    ? rawServiceId[0]
    : rawServiceId;

  if (!serviceId) {
    throw new ValidationError({
      message: "Missing required parameter: service_id.",
      action: "Provide a service_id in the route.",
    });
  }

  if (!isValidUuid(serviceId)) {
    throw new ValidationError({
      message: "service_id must be a valid UUID.",
      action: "Provide a valid service_id.",
    });
  }

  return serviceId;
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
