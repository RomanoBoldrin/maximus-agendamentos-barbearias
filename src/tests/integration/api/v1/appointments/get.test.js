import crypto from "node:crypto";

import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";
import session from "@/infra/session.js";

describe("GET /api/v1/appointments", () => {
  describe("Anonymous user", () => {
    test("Without session returns 401", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/appointments`);

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("UnauthorizedError");
      expect(responseBody.status_code).toBe(401);
    });

    test("With nonexistent session returns 401", async () => {
      const nonexistentToken = crypto.randomBytes(48).toString("hex");

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("UnauthorizedError");
    });

    test("With expired session returns 401", async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.SESSION_DURATION_IN_MILLISECONDS - 1000,
        ),
      });

      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(
        createdUser.userId,
      );

      jest.useRealTimers();

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("UnauthorizedError");
    });
  });

  describe("Admin user", () => {
    test("Sees all appointments", async () => {
      const admin = await orchestrator.createUser({
        accessLevel: "admin",
      });

      const adminSession = await orchestrator.createSession(admin.userId);

      const barber1 = await orchestrator.createBarber({
        barberName: "Barber 1",
      });

      const barber2 = await orchestrator.createBarber({
        barberName: "Barber 2",
      });

      const client1 = await orchestrator.createClient({
        clientName: "Client 1",
      });

      const client2 = await orchestrator.createClient({
        clientName: "Client 2",
      });

      const now = new Date();

      const appointment1DateTime = new Date(
        now.getTime() + 24 * 60 * 60 * 1000,
      );
      const appointment1EndDateTime = new Date(
        appointment1DateTime.getTime() + 30 * 60 * 1000,
      );

      const appointment2DateTime = new Date(
        now.getTime() + 48 * 60 * 60 * 1000,
      );
      const appointment2EndDateTime = new Date(
        appointment2DateTime.getTime() + 30 * 60 * 1000,
      );

      const appt1 = await orchestrator.createAppointment({
        barberId: barber1.barberId,
        clientId: client1.clientId,
        appointmentDatetime: appointment1DateTime,
        appointmentEndDatetime: appointment1EndDateTime,
        totalDuration: 30,
      });

      const appt2 = await orchestrator.createAppointment({
        barberId: barber2.barberId,
        clientId: client2.clientId,
        appointmentDatetime: appointment2DateTime,
        appointmentEndDatetime: appointment2EndDateTime,
        totalDuration: 30,
      });

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        headers: {
          Cookie: `session_id=${adminSession.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const returnedAppointmentIds = responseBody.map(
        (appointment) => appointment.appointment_id,
      );

      expect(returnedAppointmentIds).toContain(appt1.appointmentId);
      expect(returnedAppointmentIds).toContain(appt2.appointmentId);

      const returnedAppt1 = responseBody.find(
        (appointment) => appointment.appointment_id === appt1.appointmentId,
      );

      const returnedAppt2 = responseBody.find(
        (appointment) => appointment.appointment_id === appt2.appointmentId,
      );

      expect(returnedAppt1).toEqual(
        expect.objectContaining({
          appointment_id: appt1.appointmentId,
          total_duration: 30,
          status: "AGENDADO",
          barber: expect.objectContaining({
            barber_id: barber1.barberId,
            barber_name: "Barber 1",
          }),
          client: expect.objectContaining({
            client_id: client1.clientId,
            client_name: "Client 1",
          }),
        }),
      );

      expect(returnedAppt2).toEqual(
        expect.objectContaining({
          appointment_id: appt2.appointmentId,
          total_duration: 30,
          status: "AGENDADO",
          barber: expect.objectContaining({
            barber_id: barber2.barberId,
            barber_name: "Barber 2",
          }),
          client: expect.objectContaining({
            client_id: client2.clientId,
            client_name: "Client 2",
          }),
        }),
      );
    });
  });

  describe("Barber user", () => {
    test("Sees only own appointments", async () => {
      const user1 = await orchestrator.createUser({
        accessLevel: "barber",
      });

      const user2 = await orchestrator.createUser({
        accessLevel: "barber",
      });

      const barber1 = await orchestrator.createBarber({
        barberName: "Barber 1",
      });

      const barber2 = await orchestrator.createBarber({
        barberName: "Barber 2",
      });

      await orchestrator.linkUserToBarber(user1.userId, barber1.barberId);
      await orchestrator.linkUserToBarber(user2.userId, barber2.barberId);

      const client1 = await orchestrator.createClient({
        clientName: "Client 1",
      });

      const client2 = await orchestrator.createClient({
        clientName: "Client 2",
      });

      const now = new Date();

      const appt1DateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const appt1EndDateTime = new Date(
        appt1DateTime.getTime() + 30 * 60 * 1000,
      );

      const appt2DateTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const appt2EndDateTime = new Date(
        appt2DateTime.getTime() + 30 * 60 * 1000,
      );

      const appt1 = await orchestrator.createAppointment({
        barberId: barber1.barberId,
        clientId: client1.clientId,
        appointmentDatetime: appt1DateTime,
        appointmentEndDatetime: appt1EndDateTime,
        totalDuration: 30,
      });

      const appt2 = await orchestrator.createAppointment({
        barberId: barber2.barberId,
        clientId: client2.clientId,
        appointmentDatetime: appt2DateTime,
        appointmentEndDatetime: appt2EndDateTime,
        totalDuration: 30,
      });

      const user1Session = await orchestrator.createSession(user1.userId);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        headers: {
          Cookie: `session_id=${user1Session.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const returnedAppointmentIds = responseBody.map(
        (appointment) => appointment.appointment_id,
      );

      expect(returnedAppointmentIds).toContain(appt1.appointmentId);
      expect(returnedAppointmentIds).not.toContain(appt2.appointmentId);

      const returnedAppt1 = responseBody.find(
        (appointment) => appointment.appointment_id === appt1.appointmentId,
      );

      expect(returnedAppt1).toEqual(
        expect.objectContaining({
          appointment_id: appt1.appointmentId,
          barber: expect.objectContaining({
            barber_id: barber1.barberId,
            barber_name: "Barber 1",
          }),
          client: expect.objectContaining({
            client_id: client1.clientId,
            client_name: "Client 1",
          }),
        }),
      );
    });

    test("Without linkedBarberId returns 403", async () => {
      const barberUser = await orchestrator.createUser({
        accessLevel: "barber",
        linkedBarberId: null,
      });

      const barberSession = await orchestrator.createSession(barberUser.userId);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        headers: {
          Cookie: `session_id=${barberSession.token}`,
        },
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ForbiddenError");
      expect(responseBody.status_code).toBe(403);
    });
  });

  describe("GET /api/v1/appointments/:appointment_id", () => {
    test("Returns existing appointment with correct shape", async () => {
      const barber = await orchestrator.createBarber({ barberName: "John" });
      const service = await orchestrator.createService({
        serviceName: "Haircut",
        duration: 30,
        price: 50,
      });

      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const createResponse = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service.serviceId],
          client_name: "John Doe",
          client_phone: "123456789",
        }),
      });

      expect(createResponse.status).toBe(201);

      const createdAppointment = await createResponse.json();
      const appointmentId = createdAppointment.appointment_id;

      const response = await fetch(
        `${webserver.origin}/api/v1/appointments/${appointmentId}`,
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toMatchObject({
        appointment_id: appointmentId,
        total_duration: 30,
        status: "AGENDADO",
        client: {
          client_id: expect.any(String),
          client_name: "John Doe",
          client_phone: "123456789",
        },
        barber: {
          barber_id: barber.barberId,
          barber_name: "John",
        },
        services: [
          {
            service_id: service.serviceId,
            service_name: "Haircut",
            service_price: "50.00",
            service_duration: 30,
          },
        ],
      });
      expect(new Date(responseBody.appointment_datetime).toISOString()).toBe(
        appointmentDateTime.toISOString(),
      );
      expect(typeof responseBody.created_at).toBe("string");
      expect(typeof responseBody.updated_at).toBe("string");
    });

    test("Nonexistent valid appointment_id returns 404", async () => {
      const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

      const response = await fetch(
        `${webserver.origin}/api/v1/appointments/${fakeUuid}`,
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody.name).toBe("NotFoundError");
      expect(responseBody.message).toContain("Appointment not found");
    });

    test("Invalid appointment_id returns 400", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/appointments/invalid-uuid`,
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("appointment_id must be a valid UUID");
    });
  });
});
