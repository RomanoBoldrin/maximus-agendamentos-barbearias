import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { prisma as db } from "@/infra/prisma.js";

const router = createRouter();

router.get(getHandler);

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
