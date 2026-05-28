import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { NotFoundError, ValidationError } from "@/infra/errors";
import { prisma as db } from "@/infra/prisma.js";

const router = createRouter();

router.get(getHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

// ---------------------------------------------------------------------------
// Shared select block
// ---------------------------------------------------------------------------

const appointmentSelect = {
  appointmentId: true,
  appointmentDatetime: true,
  appointmentEndDatetime: true,
  totalDuration: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: {
      clientId: true,
      clientName: true,
      clientPhone: true,
    },
  },
  barber: {
    select: {
      barberId: true,
      barberName: true,
    },
  },
  appointmentServices: {
    select: {
      servicePrice: true,
      serviceDuration: true,
      service: {
        select: {
          serviceId: true,
          serviceName: true,
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Response mapper
// ---------------------------------------------------------------------------

function mapAppointmentResponse(appointment) {
  return {
    appointment_id: appointment.appointmentId,
    appointment_datetime: appointment.appointmentDatetime.toISOString(),
    appointment_end_datetime: appointment.appointmentEndDatetime.toISOString(),
    total_duration: appointment.totalDuration,
    status: appointment.status,
    client: {
      client_id: appointment.client.clientId,
      client_name: appointment.client.clientName,
      client_phone: appointment.client.clientPhone,
    },
    barber: {
      barber_id: appointment.barber.barberId,
      barber_name: appointment.barber.barberName,
    },
    services: appointment.appointmentServices.map((appointmentService) => ({
      service_id: appointmentService.service.serviceId,
      service_name: appointmentService.service.serviceName,
      service_price: formatMoney(appointmentService.servicePrice),
      service_duration: appointmentService.serviceDuration,
    })),
    created_at: appointment.createdAt.toISOString(),
    updated_at: appointment.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function getHandler(request, response) {
  const appointmentId = extractAppointmentId(request);

  const appointment = await db.appointment.findUnique({
    where: { appointmentId },
    select: appointmentSelect,
  });

  if (!appointment) {
    throw new NotFoundError({
      message: "Appointment not found.",
      action: "Verify if the appointment_id is correct.",
    });
  }

  return response.status(200).json(mapAppointmentResponse(appointment));
}

async function deleteHandler(request, response) {
  const appointmentId = extractAppointmentId(request);

  const appointment = await db.appointment.findUnique({
    where: { appointmentId },
    select: appointmentSelect,
  });

  if (!appointment) {
    throw new NotFoundError({
      message: "Appointment not found.",
      action: "Verify if the appointment_id is correct.",
    });
  }

  // Idempotent: already cancelled — return current data without writing
  if (appointment.status === "CANCELADO") {
    return response.status(200).json(mapAppointmentResponse(appointment));
  }

  const updatedAppointment = await db.appointment.update({
    where: { appointmentId },
    data: { status: "CANCELADO" },
    select: appointmentSelect,
  });

  return response.status(200).json(mapAppointmentResponse(updatedAppointment));
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function extractAppointmentId(request) {
  const rawAppointmentId = request.query.appointment_id;
  const appointmentId = Array.isArray(rawAppointmentId)
    ? rawAppointmentId[0]
    : rawAppointmentId;

  if (!appointmentId) {
    throw new ValidationError({
      message: "Missing required parameter: appointment_id.",
      action: "Provide an appointment_id in the route.",
    });
  }

  if (!isValidUuid(appointmentId)) {
    throw new ValidationError({
      message: "appointment_id must be a valid UUID.",
      action: "Provide a valid appointment_id.",
    });
  }

  return appointmentId;
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function formatMoney(value) {
  return Number(value).toFixed(2);
}
