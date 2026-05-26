import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { prisma as db } from "@/infra/prisma.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const barbers = await db.barber.findMany({
    where: {
      isActive: true,
    },
    select: {
      barberId: true,
      barberName: true,
      phoneNumber: true,
      workStart: true,
      workEnd: true,
      lunchStart: true,
      lunchEnd: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return response.status(200).json(
    barbers.map((barber) => ({
      barber_id: barber.barberId,
      barber_name: barber.barberName,
      phone_number: barber.phoneNumber,
      work_start: barber.workStart,
      work_end: barber.workEnd,
      lunch_start: barber.lunchStart,
      lunch_end: barber.lunchEnd,
      is_active: barber.isActive,
      created_at: barber.createdAt.toISOString(),
      updated_at: barber.updatedAt.toISOString(),
    })),
  );
}
