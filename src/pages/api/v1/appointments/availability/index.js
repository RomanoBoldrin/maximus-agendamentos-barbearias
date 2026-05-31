import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { ValidationError, NotFoundError } from "@/infra/errors";
import { prisma as db } from "@/infra/prisma.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

/**
 * GET /api/v1/appointments/availability?barber_id=<uuid>&date=<YYYY-MM-DD>
 *
 * Public endpoint (no auth required).
 * Returns which 15-minute time slots are blocked by existing appointments
 * for a given barber on a given date.
 *
 * Appointments with status CANCELADO or FALTOU are ignored.
 * The appointment end time is treated as exclusive (not blocked).
 *
 * Response shape:
 * {
 *   "barber_id": "uuid",
 *   "date": "YYYY-MM-DD",
 *   "blocked_slots": ["17:00", "17:15", "17:30"]
 * }
 */
async function getHandler(request, response) {
  const { barber_id, date } = request.query;

  // --- Validate barber_id ---
  if (!barber_id) {
    throw new ValidationError({
      message: "barber_id is required.",
      action: "Provide a valid barber_id as a query parameter.",
    });
  }

  // --- Validate date ---
  if (!date) {
    throw new ValidationError({
      message: "date is required.",
      action: "Provide a date in YYYY-MM-DD format as a query parameter.",
    });
  }

  const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateParts) {
    throw new ValidationError({
      message: "date must be in YYYY-MM-DD format.",
      action: "Provide a valid date, e.g. 2026-06-02.",
    });
  }

  const month = Number(dateParts[2]);
  const day = Number(dateParts[3]);

  // Basic calendar sanity: month 1-12, day 1-31
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new ValidationError({
      message: "date contains an invalid month or day.",
      action: "Provide a valid calendar date in YYYY-MM-DD format.",
    });
  }

  // --- Validate barber exists and is active ---
  const barber = await db.barber.findUnique({
    where: { barberId: barber_id },
    select: { barberId: true, isActive: true },
  });

  if (!barber) {
    throw new NotFoundError({
      message: "Barber not found.",
      action: "Verify the barber_id.",
    });
  }

  if (!barber.isActive) {
    throw new NotFoundError({
      message: "Barber not found.",
      action: "Verify the barber_id.",
    });
  }

  // --- Build day boundaries ---
  // Construct date boundaries using the IANA timezone for the barbershop.
  // This avoids manual UTC offset calculations and handles DST automatically.
  const dayStartLocal = new Date(`${date}T00:00:00`);
  const dayEndLocal = new Date(dayStartLocal);
  dayEndLocal.setDate(dayEndLocal.getDate() + 1);

  // --- Query appointments that overlap the selected day ---
  const appointments = await db.appointment.findMany({
    where: {
      barberId: barber_id,
      status: { notIn: ["CANCELADO", "FALTOU"] },
      appointmentDatetime: { lt: dayEndLocal },
      appointmentEndDatetime: { gt: dayStartLocal },
    },
    select: {
      appointmentDatetime: true,
      appointmentEndDatetime: true,
    },
  });

  // --- Compute blocked 15-minute slots ---
  const blockedSet = new Set();

  for (const appointment of appointments) {
    const startMs = appointment.appointmentDatetime.getTime();
    const endMs = appointment.appointmentEndDatetime.getTime();

    // Walk every 15-minute boundary within [start, end)
    let currentMs = startMs;

    while (currentMs < endMs) {
      const slotDate = new Date(currentMs);

      // Only include slots that fall on the requested day
      if (
        currentMs >= dayStartLocal.getTime() &&
        currentMs < dayEndLocal.getTime()
      ) {
        const hours = String(slotDate.getHours()).padStart(2, "0");
        const minutes = String(slotDate.getMinutes()).padStart(2, "0");

        blockedSet.add(`${hours}:${minutes}`);
      }

      currentMs += 15 * 60 * 1000;
    }
  }

  // Sort slots chronologically
  const blockedSlots = Array.from(blockedSet).sort();

  return response.status(200).json({
    barber_id: barber_id,
    date: date,
    blocked_slots: blockedSlots,
  });
}
