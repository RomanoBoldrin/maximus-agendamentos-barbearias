import { createRouter } from "next-connect";

import authentication from "@/infra/authentication";
import authorization from "@/infra/authorization";
import controller from "@/infra/controller";
import { ValidationError, NotFoundError, ForbiddenError } from "@/infra/errors";
import { prisma as db } from "@/infra/prisma.js";

const router = createRouter();

router.post(postHandler);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const {
    barber_id,
    appointment_datetime,
    service_ids,
    client_name,
    client_phone,
  } = request.body;

  // Validation: required fields
  if (!barber_id) {
    const publicErrorObject = new ValidationError();
    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "barber_id is required.",
      action: "Provide a valid barber_id.",
      status_code: 400,
    });
  }

  if (!appointment_datetime) {
    const publicErrorObject = new ValidationError();
    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "appointment_datetime is required.",
      action: "Provide a valid ISO8601 datetime.",
      status_code: 400,
    });
  }

  if (!service_ids) {
    const publicErrorObject = new ValidationError();
    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "service_ids is required.",
      action: "Provide an array of service IDs.",
      status_code: 400,
    });
  }

  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "service_ids must be a non-empty array.",
      action: "Provide at least one service ID.",
      status_code: 400,
    });
  }

  if (
    !client_name ||
    typeof client_name !== "string" ||
    client_name.trim() === ""
  ) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "client_name is required and cannot be empty.",
      action: "Provide a valid client name.",
      status_code: 400,
    });
  }

  // Validate datetime is valid
  const appointmentDateTime = new Date(appointment_datetime);
  if (isNaN(appointmentDateTime.getTime())) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "appointment_datetime must be a valid ISO8601 date.",
      action: "Provide a valid ISO8601 datetime.",
      status_code: 400,
    });
  }

  // Validate datetime is not in the past
  if (appointmentDateTime < new Date()) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "appointment_datetime cannot be in the past.",
      action: "Provide a future appointment date.",
      status_code: 400,
    });
  }

  // Validation: barber exists and is active
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
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "Barber is not active.",
      action: "Select an active barber.",
      status_code: 400,
    });
  }

  // Check for duplicate service IDs
  const uniqueServiceIds = Array.from(new Set(service_ids));
  if (uniqueServiceIds.length !== service_ids.length) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "Duplicate service IDs are not allowed.",
      action: "Remove duplicate service IDs.",
      status_code: 400,
    });
  }

  // Validation: all services exist and are active
  const services = await db.service.findMany({
    where: {
      serviceId: { in: uniqueServiceIds },
    },
    select: {
      serviceId: true,
      serviceName: true,
      isActive: true,
      duration: true,
      price: true,
    },
  });

  if (services.length !== uniqueServiceIds.length) {
    throw new NotFoundError({
      message: "One or more services not found.",
      action: "Verify the service IDs.",
    });
  }

  const inactiveService = services.find((s) => !s.isActive);
  if (inactiveService) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: `Service "${inactiveService.serviceName}" is not active.`,
      action: "Select only active services.",
      status_code: 400,
    });
  }

  // Calculate total duration and end datetime
  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  const appointmentEndDatetime = new Date(
    appointmentDateTime.getTime() + totalDuration * 60 * 1000,
  );

  try {
    // Use transaction for atomicity
    const result = await db.$transaction(async (tx) => {
      // Create client
      const client = await tx.client.create({
        data: {
          clientName: client_name.trim(),
          clientPhone: client_phone || null,
          isActive: true,
        },
        select: {
          clientId: true,
        },
      });

      // Create appointment
      const appointment = await tx.appointment.create({
        data: {
          appointmentDatetime: appointmentDateTime,
          appointmentEndDatetime: appointmentEndDatetime,
          totalDuration,
          status: "AGENDADO",
          clientId: client.clientId,
          barberId: barber_id,
        },
        select: {
          appointmentId: true,
          appointmentDatetime: true,
          appointmentEndDatetime: true,
          totalDuration: true,
          status: true,
          clientId: true,
          barberId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create appointment services
      await tx.appointmentService.createMany({
        data: services.map((service) => ({
          appointmentId: appointment.appointmentId,
          serviceId: service.serviceId,
          servicePrice: service.price,
          serviceDuration: service.duration,
        })),
      });

      return {
        appointment,
        services,
      };
    });

    return response.status(201).json({
      appointment_id: result.appointment.appointmentId,
      appointment_datetime:
        result.appointment.appointmentDatetime.toISOString(),
      appointment_end_datetime:
        result.appointment.appointmentEndDatetime.toISOString(),
      total_duration: result.appointment.totalDuration,
      status: result.appointment.status,
      client_id: result.appointment.clientId,
      barber_id: result.appointment.barberId,
      created_at: result.appointment.createdAt.toISOString(),
      updated_at: result.appointment.updatedAt.toISOString(),
      services: result.services.map((service) => ({
        service_id: service.serviceId,
        service_name: service.serviceName,
        service_price: Number(service.price).toFixed(2),
        service_duration: service.duration,
      })),
    });
  } catch (error) {
    // Handle unique constraint violation (duplicate barber + datetime)
    if (error.code === "P2002") {
      const publicErrorObject = new ValidationError();

      return response.status(publicErrorObject.statusCode).json({
        name: "ValidationError",
        message: "An appointment already exists for this barber at this time.",
        action: "Choose a different date or time.",
        status_code: 400,
      });
    }

    throw error;
  }
}

async function getHandler(request, response) {
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );

  const { user } =
    await authentication.getAuthenticatedUserFromRequest(request);

  // Determine filter based on user role
  let whereClause = {};

  if (!authorization.isAdmin(user)) {
    // Barber must have linkedBarberId to see appointments
    if (!user.linkedBarberId) {
      throw new ForbiddenError({
        message: "Barber profile not linked. Cannot access appointments.",
        action: "Contact an administrator.",
      });
    }

    whereClause.barberId = user.linkedBarberId;
  }

  const appointments = await db.appointment.findMany({
    where: whereClause,
    select: {
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
          serviceId: true,
          service: {
            select: {
              serviceName: true,
            },
          },
          servicePrice: true,
          serviceDuration: true,
        },
      },
    },
    orderBy: {
      appointmentDatetime: "asc",
    },
  });

  return response.status(200).json(
    appointments.map((appointment) => ({
      appointment_id: appointment.appointmentId,
      appointment_datetime: appointment.appointmentDatetime.toISOString(),
      appointment_end_datetime:
        appointment.appointmentEndDatetime.toISOString(),
      total_duration: appointment.totalDuration,
      status: appointment.status,
      created_at: appointment.createdAt.toISOString(),
      updated_at: appointment.updatedAt.toISOString(),
      client: {
        client_id: appointment.client.clientId,
        client_name: appointment.client.clientName,
        client_phone: appointment.client.clientPhone,
      },
      barber: {
        barber_id: appointment.barber.barberId,
        barber_name: appointment.barber.barberName,
      },
      services: appointment.appointmentServices.map((as) => ({
        service_id: as.serviceId,
        service_name: as.service.serviceName,
        service_price: Number(as.servicePrice).toFixed(2),
        service_duration: as.serviceDuration,
      })),
    })),
  );
}
