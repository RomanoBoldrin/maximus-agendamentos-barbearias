import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";

describe("POST /api/v1/appointments", () => {
  describe("Anonymous user", () => {
    test("Creates appointment with one service", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "John",
      });

      const service = await orchestrator.createService({
        serviceName: "Haircut",
        duration: 30,
        price: 50,
      });

      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
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

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody.appointment_id).toBeTruthy();
      expect(responseBody.barber_id).toBe(barber.barberId);
      expect(responseBody.total_duration).toBe(30);
      expect(responseBody.status).toBe("AGENDADO");
      expect(responseBody.services).toHaveLength(1);
      expect(responseBody.services[0]).toEqual({
        service_id: service.serviceId,
        service_name: "Haircut",
        service_price: "50.00",
        service_duration: 30,
      });

      const expectedEndDateTime = new Date(
        appointmentDateTime.getTime() + 30 * 60 * 1000,
      );
      expect(new Date(responseBody.appointment_end_datetime).getTime()).toBe(
        expectedEndDateTime.getTime(),
      );
    });

    test("Creates appointment with multiple services", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "John",
      });

      const service1 = await orchestrator.createService({
        serviceName: "Haircut",
        duration: 30,
        price: 50,
      });

      const service2 = await orchestrator.createService({
        serviceName: "Beard Trim",
        duration: 20,
        price: 30,
      });

      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service1.serviceId, service2.serviceId],
          client_name: "Jane Doe",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody.total_duration).toBe(50); // 30 + 20
      expect(responseBody.services).toHaveLength(2);

      const expectedEndDateTime = new Date(
        appointmentDateTime.getTime() + 50 * 60 * 1000,
      );
      expect(new Date(responseBody.appointment_end_datetime).getTime()).toBe(
        expectedEndDateTime.getTime(),
      );
    });

    test("Missing barber_id returns 400", async () => {
      const service = await orchestrator.createService();
      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service.serviceId],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("barber_id");
    });

    test("Missing appointment_datetime returns 400", async () => {
      const barber = await orchestrator.createBarber();
      const service = await orchestrator.createService();

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          service_ids: [service.serviceId],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("appointment_datetime");
    });

    test("Missing service_ids returns 400", async () => {
      const barber = await orchestrator.createBarber();
      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("service_ids");
    });

    test("Empty service_ids returns 400", async () => {
      const barber = await orchestrator.createBarber();
      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("non-empty");
    });

    test("Missing client_name returns 400", async () => {
      const barber = await orchestrator.createBarber();
      const service = await orchestrator.createService();
      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service.serviceId],
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("client_name");
    });

    test("Nonexistent barber returns 404", async () => {
      const service = await orchestrator.createService();
      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: fakeUuid,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service.serviceId],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("NotFoundError");
      expect(responseBody.message).toContain("Barber");
    });

    test("Inactive barber returns 400", async () => {
      const barber = await orchestrator.createBarber({
        isActive: false,
      });

      const service = await orchestrator.createService();
      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service.serviceId],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("not active");
    });

    test("Nonexistent service returns 404", async () => {
      const barber = await orchestrator.createBarber();
      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [fakeUuid],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("NotFoundError");
      expect(responseBody.message).toContain("services not found");
    });

    test("Inactive service returns 400", async () => {
      const barber = await orchestrator.createBarber();
      const service = await orchestrator.createService({
        isActive: false,
      });

      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service.serviceId],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("not active");
    });

    test("Duplicate appointment time returns 400", async () => {
      const barber = await orchestrator.createBarber();
      const service = await orchestrator.createService();
      const client = await orchestrator.createClient();

      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Create first appointment
      await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: appointmentDateTime,
        appointmentEndDatetime: new Date(
          appointmentDateTime.getTime() + 30 * 60 * 1000,
        ),
        totalDuration: 30,
        status: "AGENDADO",
      });

      // Try to create second appointment at same time
      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service.serviceId],
          client_name: "Jane Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain(
        "Um agendamento já existe para este barbeiro neste horário.",
      );
    });

    test("Duplicate service IDs returns 400", async () => {
      const barber = await orchestrator.createBarber();
      const service = await orchestrator.createService();
      const appointmentDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: appointmentDateTime.toISOString(),
          service_ids: [service.serviceId, service.serviceId],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("Duplicate");
    });

    test("Appointment datetime in the past returns 400", async () => {
      const barber = await orchestrator.createBarber();
      const service = await orchestrator.createService();
      const pastDateTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

      const response = await fetch(`${webserver.origin}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: barber.barberId,
          appointment_datetime: pastDateTime.toISOString(),
          service_ids: [service.serviceId],
          client_name: "John Doe",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("ValidationError");
      expect(responseBody.message).toContain("past");
    });
  });
});
