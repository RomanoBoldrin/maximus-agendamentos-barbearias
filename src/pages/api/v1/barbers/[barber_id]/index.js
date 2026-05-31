import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { prisma as db } from "@/infra/prisma.js";

import { NotFoundError, ValidationError } from "@/infra/errors";
import authentication from "@/infra/authentication.js";
import authorization from "@/infra/authorization.js";

const router = createRouter();

router.delete(deleteHandler);
router.patch(patchHandler);

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

function isValidTimeFormat(timeString) {
  if (!timeString) return true;
  return /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
}

function timeToMinutes(timeString) {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

async function patchHandler(request, response) {
  const { user } =
    await authentication.getAuthenticatedUserFromRequest(request);
  authorization.ensureAdmin(user);

  const barberId = extractBarberId(request);

  if (Object.keys(request.body).length === 0) {
    throw new ValidationError({
      message: "The request body is empty.",
      action: "Provide the fields to update.",
    });
  }

  const {
    barber_name,
    phone_number,
    work_start,
    work_end,
    lunch_start,
    lunch_end,
  } = request.body;

  const dataToUpdate = {};

  if (barber_name !== undefined) {
    if (typeof barber_name !== "string" || barber_name.trim() === "") {
      throw new ValidationError({
        message: "O nome do barbeiro é obrigatório e não pode ser vazio.",
        action: "Forneça um nome válido para o barbeiro.",
      });
    }
    dataToUpdate.barberName = barber_name.trim();
  }

  if (phone_number !== undefined) {
    dataToUpdate.phoneNumber = phone_number
      ? String(phone_number).trim()
      : null;
  }

  if (work_start !== undefined || work_end !== undefined) {
    if (work_start === undefined || work_end === undefined) {
      throw new ValidationError({
        message: "É necessário fornecer o início e o fim do expediente.",
        action: "Preencha os dois campos do expediente.",
      });
    }

    if (!isValidTimeFormat(work_start) || !isValidTimeFormat(work_end)) {
      throw new ValidationError({
        message: "Formato de hora inválido para o expediente.",
        action: "Forneça os horários no formato HH:mm.",
      });
    }

    if (work_start && work_end) {
      const startMin = timeToMinutes(work_start);
      const endMin = timeToMinutes(work_end);
      if (startMin >= endMin) {
        throw new ValidationError({
          message: "O início do expediente deve ser anterior ao fim.",
          action: "Ajuste os horários do expediente.",
        });
      }
    }

    dataToUpdate.workStart = work_start || null;
    dataToUpdate.workEnd = work_end || null;
  }

  if (lunch_start !== undefined || lunch_end !== undefined) {
    if (lunch_start === undefined || lunch_end === undefined) {
      throw new ValidationError({
        message: "É necessário fornecer o início e o fim do horário de almoço.",
        action: "Preencha os dois campos do horário de almoço.",
      });
    }

    if (!isValidTimeFormat(lunch_start) || !isValidTimeFormat(lunch_end)) {
      throw new ValidationError({
        message: "Formato de hora inválido para o almoço.",
        action: "Forneça os horários no formato HH:mm.",
      });
    }

    if (lunch_start && lunch_end) {
      const startMin = timeToMinutes(lunch_start);
      const endMin = timeToMinutes(lunch_end);
      if (startMin >= endMin) {
        throw new ValidationError({
          message: "O início do almoço deve ser anterior ao fim.",
          action: "Ajuste os horários de almoço.",
        });
      }
    }

    dataToUpdate.lunchStart = lunch_start || null;
    dataToUpdate.lunchEnd = lunch_end || null;
  }

  const existingBarber = await db.barber.findUnique({
    where: { barberId },
    select: {
      isActive: true,
      workStart: true,
      workEnd: true,
      lunchStart: true,
      lunchEnd: true,
    },
  });

  if (!existingBarber || !existingBarber.isActive) {
    throw new NotFoundError({
      message: "Barber not found or is inactive.",
      action: "Verify if the barber_id is correct and the barber is active.",
    });
  }

  if (Object.keys(dataToUpdate).length === 0) {
    throw new ValidationError({
      message: "Nenhum campo válido para atualização foi fornecido.",
      action: "Forneça ao menos um campo válido.",
    });
  }

  const finalWorkStart =
    dataToUpdate.workStart !== undefined
      ? dataToUpdate.workStart
      : existingBarber.workStart;
  const finalWorkEnd =
    dataToUpdate.workEnd !== undefined
      ? dataToUpdate.workEnd
      : existingBarber.workEnd;
  const finalLunchStart =
    dataToUpdate.lunchStart !== undefined
      ? dataToUpdate.lunchStart
      : existingBarber.lunchStart;
  const finalLunchEnd =
    dataToUpdate.lunchEnd !== undefined
      ? dataToUpdate.lunchEnd
      : existingBarber.lunchEnd;

  if (finalLunchStart && finalLunchEnd && finalWorkStart && finalWorkEnd) {
    const wStart = timeToMinutes(finalWorkStart);
    const wEnd = timeToMinutes(finalWorkEnd);
    const lStart = timeToMinutes(finalLunchStart);
    const lEnd = timeToMinutes(finalLunchEnd);

    if (lStart < wStart || lEnd > wEnd) {
      throw new ValidationError({
        message: "O horário de almoço deve estar dentro do expediente.",
        action:
          "Ajuste os horários para que o almoço ocorra durante o expediente.",
      });
    }
  }

  const updatedBarber = await db.barber.update({
    where: { barberId },
    data: dataToUpdate,
    select: barberSelect,
  });

  return response.status(200).json(mapBarberResponse(updatedBarber));
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
