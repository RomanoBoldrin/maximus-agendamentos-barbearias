import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";

const availabilityUrl = `${webserver.origin}/api/v1/appointments/availability`;

describe("GET /api/v1/appointments/availability", () => {
  describe("Validation", () => {
    test("Returns 400 when barber_id is missing", async () => {
      const response = await fetch(`${availabilityUrl}?date=2026-06-02`);

      expect(response.status).toBe(400);

      const body = await response.json();

      expect(body.name).toBe("ValidationError");
      expect(body.message).toContain("barber_id");
    });

    test("Returns 400 when date is missing", async () => {
      const response = await fetch(
        `${availabilityUrl}?barber_id=some-barber-id`,
      );

      expect(response.status).toBe(400);

      const body = await response.json();

      expect(body.name).toBe("ValidationError");
      expect(body.message).toContain("date");
    });

    test("Returns 400 when date format is invalid", async () => {
      const barber = await orchestrator.createBarber();

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=06-02-2026`,
      );

      expect(response.status).toBe(400);

      const body = await response.json();

      expect(body.name).toBe("ValidationError");
      expect(body.message).toContain("YYYY-MM-DD");
    });

    test("Returns 404 when barber does not exist", async () => {
      const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

      const response = await fetch(
        `${availabilityUrl}?barber_id=${fakeUuid}&date=2026-06-02`,
      );

      expect(response.status).toBe(404);

      const body = await response.json();

      expect(body.name).toBe("NotFoundError");
      expect(body.message).toContain("Barber");
    });

    test("Returns 404 when barber is inactive", async () => {
      const barber = await orchestrator.createBarber({ isActive: false });

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(404);

      const body = await response.json();

      expect(body.name).toBe("NotFoundError");
    });
  });

  describe("Availability logic", () => {
    test("Returns empty blocked_slots when there are no appointments", async () => {
      const barber = await orchestrator.createBarber();

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body.barber_id).toBe(barber.barberId);
      expect(body.date).toBe("2026-06-02");
      expect(body.blocked_slots).toEqual([]);
    });

    test("Blocks all 15-minute slots inside an existing appointment range", async () => {
      const barber = await orchestrator.createBarber();
      const client = await orchestrator.createClient();

      // Appointment from 17:00 to 17:45 on 2026-06-02
      const appointmentStart = new Date("2026-06-02T17:00:00-03:00");
      const appointmentEnd = new Date("2026-06-02T17:45:00-03:00");

      await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: appointmentStart,
        appointmentEndDatetime: appointmentEnd,
        totalDuration: 45,
        status: "AGENDADO",
      });

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body.blocked_slots).toContain("17:00");
      expect(body.blocked_slots).toContain("17:15");
      expect(body.blocked_slots).toContain("17:30");
    });

    test("Does not block the exact end boundary", async () => {
      const barber = await orchestrator.createBarber();
      const client = await orchestrator.createClient();

      // Appointment from 17:00 to 17:45 on 2026-06-02
      const appointmentStart = new Date("2026-06-02T17:00:00-03:00");
      const appointmentEnd = new Date("2026-06-02T17:45:00-03:00");

      await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: appointmentStart,
        appointmentEndDatetime: appointmentEnd,
        totalDuration: 45,
        status: "AGENDADO",
      });

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      // 17:45 is the end boundary and should NOT be blocked
      expect(body.blocked_slots).not.toContain("17:45");
    });

    test("Ignores appointments with status CANCELADO", async () => {
      const barber = await orchestrator.createBarber();
      const client = await orchestrator.createClient();

      const appointmentStart = new Date("2026-06-02T10:00:00-03:00");
      const appointmentEnd = new Date("2026-06-02T10:30:00-03:00");

      await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: appointmentStart,
        appointmentEndDatetime: appointmentEnd,
        totalDuration: 30,
        status: "CANCELADO",
      });

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body.blocked_slots).toEqual([]);
    });

    test("Ignores appointments with status FALTOU", async () => {
      const barber = await orchestrator.createBarber();
      const client = await orchestrator.createClient();

      const appointmentStart = new Date("2026-06-02T14:00:00-03:00");
      const appointmentEnd = new Date("2026-06-02T14:30:00-03:00");

      await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: appointmentStart,
        appointmentEndDatetime: appointmentEnd,
        totalDuration: 30,
        status: "FALTOU",
      });

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body.blocked_slots).toEqual([]);
    });

    test("Does not expose client data or full appointment data in the response", async () => {
      const barber = await orchestrator.createBarber();
      const client = await orchestrator.createClient({
        clientName: "Secret Client",
        clientPhone: "11999999999",
      });

      const appointmentStart = new Date("2026-06-02T09:00:00-03:00");
      const appointmentEnd = new Date("2026-06-02T09:30:00-03:00");

      await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: appointmentStart,
        appointmentEndDatetime: appointmentEnd,
        totalDuration: 30,
        status: "AGENDADO",
      });

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();
      const bodyString = JSON.stringify(body);

      // Response must not contain client data
      expect(bodyString).not.toContain("Secret Client");
      expect(bodyString).not.toContain("11999999999");

      // Response must not contain appointment IDs or full appointment objects
      expect(body.appointment_id).toBeUndefined();
      expect(body.appointments).toBeUndefined();
      expect(body.client_name).toBeUndefined();
      expect(body.client_phone).toBeUndefined();

      // Response must only contain the expected keys
      expect(Object.keys(body).sort()).toEqual(
        ["barber_id", "blocked_slots", "date"].sort(),
      );
    });

    test("Blocks slots from multiple appointments on the same day", async () => {
      const barber = await orchestrator.createBarber();
      const client = await orchestrator.createClient();

      // First appointment: 09:00 to 09:30
      await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: new Date("2026-06-02T09:00:00-03:00"),
        appointmentEndDatetime: new Date("2026-06-02T09:30:00-03:00"),
        totalDuration: 30,
        status: "AGENDADO",
      });

      // Second appointment: 15:00 to 15:45
      await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: new Date("2026-06-02T15:00:00-03:00"),
        appointmentEndDatetime: new Date("2026-06-02T15:45:00-03:00"),
        totalDuration: 45,
        status: "AGENDADO",
      });

      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      // First appointment slots
      expect(body.blocked_slots).toContain("09:00");
      expect(body.blocked_slots).toContain("09:15");

      // Second appointment slots
      expect(body.blocked_slots).toContain("15:00");
      expect(body.blocked_slots).toContain("15:15");
      expect(body.blocked_slots).toContain("15:30");

      // Boundaries should not be blocked
      expect(body.blocked_slots).not.toContain("09:30");
      expect(body.blocked_slots).not.toContain("15:45");
    });

    test("Does not return slots from a different barber", async () => {
      const barber1 = await orchestrator.createBarber({
        barberName: "Barber A",
      });
      const barber2 = await orchestrator.createBarber({
        barberName: "Barber B",
      });
      const client = await orchestrator.createClient();

      // Appointment for barber2 only
      await orchestrator.createAppointment({
        barberId: barber2.barberId,
        clientId: client.clientId,
        appointmentDatetime: new Date("2026-06-02T11:00:00-03:00"),
        appointmentEndDatetime: new Date("2026-06-02T11:30:00-03:00"),
        totalDuration: 30,
        status: "AGENDADO",
      });

      // Query availability for barber1 — should have no blocked slots
      const response = await fetch(
        `${availabilityUrl}?barber_id=${barber1.barberId}&date=2026-06-02`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body.blocked_slots).toEqual([]);
    });
  });
});
