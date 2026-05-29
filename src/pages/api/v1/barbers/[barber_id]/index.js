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

const barberSelect = {
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
};

// ---------------------------------------------------------------------------
// Response mapper
// ---------------------------------------------------------------------------

function mapBarberResponse(barber) {
  return {
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
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function deleteHandler(request, response) {
  const { user } =
    await authentication.getAuthenticatedUserFromRequest(request);
  authorization.ensureAdmin(user);

  const barberId = extractBarberId(request);

  const barber = await db.barber.findUnique({
    where: { barberId },
    select: {
      ...barberSelect,
      user: {
        select: { userId: true },
      },
    },
  });

  if (!barber) {
    throw new NotFoundError({
      message: "Barber not found.",
      action: "Verify if the barber_id is correct.",
    });
  }

  // Idempotent: already inactive — return current data without writing
  if (!barber.isActive) {
    return response.status(200).json({
      barber: mapBarberResponse(barber),
      cancelled_appointments_count: 0,
    });
  }

  const { updatedBarber, cancelledCount } = await db.$transaction(
    async (tx) => {
      // Step 1: Deactivate barber
      const updated = await tx.barber.update({
        where: { barberId },
        data: { isActive: false },
        select: barberSelect,
      });

      // Step 2: Deactivate linked user (if exists)
      if (barber.user) {
        await tx.user.update({
          where: { userId: barber.user.userId },
          data: { isActive: false },
        });
      }

      // Step 3: Cancel future AGENDADO appointments
      const cancelResult = await tx.appointment.updateMany({
        where: {
          barberId,
          status: "AGENDADO",
          appointmentDatetime: { gte: new Date() },
        },
        data: { status: "CANCELADO" },
      });

      return { updatedBarber: updated, cancelledCount: cancelResult.count };
    },
  );

  return response.status(200).json({
    barber: mapBarberResponse(updatedBarber),
    cancelled_appointments_count: cancelledCount,
  });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function extractBarberId(request) {
  const rawBarberId = request.query.barber_id;
  const barberId = Array.isArray(rawBarberId) ? rawBarberId[0] : rawBarberId;

  if (!barberId) {
    throw new ValidationError({
      message: "Missing required parameter: barber_id.",
      action: "Provide a barber_id in the route.",
    });
  }

  if (!isValidUuid(barberId)) {
    throw new ValidationError({
      message: "barber_id must be a valid UUID.",
      action: "Provide a valid barber_id.",
    });
  }

  return barberId;
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
