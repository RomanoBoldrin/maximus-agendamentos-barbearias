import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";
import { prisma as db } from "@/infra/prisma.js";

describe("DELETE /api/v1/appointments/:appointment_id", () => {
  async function createFullAppointment({ status } = {}) {
    const barber = await orchestrator.createBarber({ barberName: "John" });
    const service = await orchestrator.createService({
      serviceName: "Haircut",
      duration: 30,
      price: 50,
    });
    const client = await orchestrator.createClient({
      clientName: "Jane Doe",
      clientPhone: "11999999999",
    });

    const appointmentDatetime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const appointmentEndDatetime = new Date(
      appointmentDatetime.getTime() + 30 * 60 * 1000,
    );

    const appointment = await orchestrator.createAppointment({
      barberId: barber.barberId,
      clientId: client.clientId,
      appointmentDatetime,
      appointmentEndDatetime,
      totalDuration: 30,
      status: status || "AGENDADO",
    });

    await db.appointmentService.create({
      data: {
        appointmentId: appointment.appointmentId,
        serviceId: service.serviceId,
        servicePrice: service.price,
        serviceDuration: service.duration,
      },
    });

    return { appointment, barber, service, client };
  }

  test("Existing AGENDADO appointment can be cancelled — returns 200 with status CANCELADO", async () => {
    const { appointment } = await createFullAppointment();

    const response = await fetch(
      `${webserver.origin}/api/v1/appointments/${appointment.appointmentId}`,
      { method: "DELETE" },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toMatchObject({
      appointment_id: appointment.appointmentId,
      status: "CANCELADO",
      total_duration: 30,
      client: expect.objectContaining({ client_name: "Jane Doe" }),
      barber: expect.objectContaining({ barber_name: "John" }),
      services: [
        expect.objectContaining({
          service_name: "Haircut",
          service_price: "50.00",
          service_duration: 30,
        }),
      ],
    });

    expect(typeof responseBody.appointment_datetime).toBe("string");
    expect(typeof responseBody.updated_at).toBe("string");
  });

  test("Cancelled appointment remains queryable via GET with status CANCELADO", async () => {
    const { appointment } = await createFullAppointment();

    // Cancel it
    await fetch(
      `${webserver.origin}/api/v1/appointments/${appointment.appointmentId}`,
      { method: "DELETE" },
    );

    // Verify GET still works
    const getResponse = await fetch(
      `${webserver.origin}/api/v1/appointments/${appointment.appointmentId}`,
    );

    expect(getResponse.status).toBe(200);

    const responseBody = await getResponse.json();

    expect(responseBody.appointment_id).toBe(appointment.appointmentId);
    expect(responseBody.status).toBe("CANCELADO");
  });

  test("Cancelling an already-CANCELADO appointment is idempotent — returns 200", async () => {
    const { appointment } = await createFullAppointment({
      status: "CANCELADO",
    });

    const response = await fetch(
      `${webserver.origin}/api/v1/appointments/${appointment.appointmentId}`,
      { method: "DELETE" },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody.appointment_id).toBe(appointment.appointmentId);
    expect(responseBody.status).toBe("CANCELADO");
  });

  test("Calling DELETE twice is idempotent — both return 200 with status CANCELADO", async () => {
    const { appointment } = await createFullAppointment();

    const first = await fetch(
      `${webserver.origin}/api/v1/appointments/${appointment.appointmentId}`,
      { method: "DELETE" },
    );
    const second = await fetch(
      `${webserver.origin}/api/v1/appointments/${appointment.appointmentId}`,
      { method: "DELETE" },
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const secondBody = await second.json();
    expect(secondBody.status).toBe("CANCELADO");
  });

  test("Nonexistent valid appointment_id returns 404", async () => {
    const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

    const response = await fetch(
      `${webserver.origin}/api/v1/appointments/${fakeUuid}`,
      { method: "DELETE" },
    );

    expect(response.status).toBe(404);

    const responseBody = await response.json();
    expect(responseBody.name).toBe("NotFoundError");
    expect(responseBody.message).toContain("Appointment not found");
  });

  test("Invalid appointment_id (not a UUID) returns 400", async () => {
    const response = await fetch(
      `${webserver.origin}/api/v1/appointments/invalid-uuid`,
      { method: "DELETE" },
    );

    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.name).toBe("ValidationError");
    expect(responseBody.message).toContain(
      "appointment_id must be a valid UUID",
    );
  });

  test("Cancelled appointment is not physically deleted from the database", async () => {
    const { appointment } = await createFullAppointment();

    await fetch(
      `${webserver.origin}/api/v1/appointments/${appointment.appointmentId}`,
      { method: "DELETE" },
    );

    const row = await db.appointment.findUnique({
      where: { appointmentId: appointment.appointmentId },
    });

    expect(row).not.toBeNull();
    expect(row.status).toBe("CANCELADO");
  });

  test("AppointmentServices remain associated after cancellation", async () => {
    const { appointment, service } = await createFullAppointment();

    await fetch(
      `${webserver.origin}/api/v1/appointments/${appointment.appointmentId}`,
      { method: "DELETE" },
    );

    const appointmentServices = await db.appointmentService.findMany({
      where: { appointmentId: appointment.appointmentId },
    });

    expect(appointmentServices).toHaveLength(1);
    expect(appointmentServices[0].serviceId).toBe(service.serviceId);
  });
});
