import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { prisma as db } from "@/infra/prisma.js";

import { ValidationError } from "@/infra/errors";
import authentication from "@/infra/authentication.js";
import authorization from "@/infra/authorization.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const services = await db.service.findMany({
    where: {
      isActive: true,
    },
    select: {
      serviceId: true,
      serviceName: true,
      serviceDescription: true,
      duration: true,
      price: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return response.status(200).json(
    services.map((service) => ({
      service_id: service.serviceId,
      service_name: service.serviceName,
      service_description: service.serviceDescription,
      duration: service.duration,
      price: Number(service.price).toFixed(2),
      is_active: service.isActive,
      created_at: service.createdAt.toISOString(),
      updated_at: service.updatedAt.toISOString(),
    })),
  );
}

async function postHandler(request, response) {
  const { user } =
    await authentication.getAuthenticatedUserFromRequest(request);
  authorization.ensureAdmin(user);

  const { service_name, service_description, duration, price } = request.body;

  if (
    !service_name ||
    typeof service_name !== "string" ||
    service_name.trim() === ""
  ) {
    throw new ValidationError({
      message: "O nome do serviço é obrigatório.",
      action: "Forneça um nome para o serviço.",
    });
  }

  if (
    duration === undefined ||
    typeof duration !== "number" ||
    duration <= 0 ||
    !Number.isInteger(duration)
  ) {
    throw new ValidationError({
      message:
        "A duração do serviço é obrigatória e deve ser um número inteiro positivo.",
      action: "Forneça uma duração válida.",
    });
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    throw new ValidationError({
      message:
        "O preço do serviço é obrigatório e deve ser um número positivo.",
      action: "Forneça um preço válido.",
    });
  }

  const createdService = await db.service.create({
    data: {
      serviceName: service_name.trim(),
      serviceDescription: service_description
        ? service_description.trim()
        : null,
      duration,
      price: Number(price),
    },
    select: {
      serviceId: true,
      serviceName: true,
      serviceDescription: true,
      duration: true,
      price: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return response.status(201).json({
    service_id: createdService.serviceId,
    service_name: createdService.serviceName,
    service_description: createdService.serviceDescription,
    duration: createdService.duration,
    price: Number(createdService.price).toFixed(2),
    is_active: createdService.isActive,
    created_at: createdService.createdAt.toISOString(),
    updated_at: createdService.updatedAt.toISOString(),
  });
}
