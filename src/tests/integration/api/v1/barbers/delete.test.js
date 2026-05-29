import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";
import { prisma as db } from "@/infra/prisma.js";

describe("DELETE /api/v1/barbers/[barber_id]", () => {
  describe("Anonymous user", () => {
    test("Cannot delete barber (401)", async () => {
      await orchestrator.clearDatabase();

      const barber = await orchestrator.createBarber({
        barberName: "Barber to delete",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("UnauthorizedError");
    });
  });

  describe("Authenticated Barber user", () => {
    test("Cannot delete barber (403)", async () => {
      const barberUser = await orchestrator.createUser({
        accessLevel: "barber",
      });
      const session = await orchestrator.createSession(barberUser.userId);

      const barber = await orchestrator.createBarber({
        barberName: "Barber forbidden",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${session.token}`,
          },
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("ForbiddenError");
    });
  });

  describe("Authenticated Admin user", () => {
    let adminSessionToken;

    beforeAll(async () => {
      const adminUser = await orchestrator.createUser({
        accessLevel: "admin",
      });
      const session = await orchestrator.createSession(adminUser.userId);
      adminSessionToken = session.token;
    });

    // ── Core soft-delete ──────────────────────────────────────────────────

    test("Can soft-delete an active barber (200)", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber to soft-delete",
        phoneNumber: "11999999999",
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.barber).toEqual(
        expect.objectContaining({
          barber_id: barber.barberId,
          barber_name: "Barber to soft-delete",
          phone_number: "11999999999",
          work_start: "08:00",
          work_end: "18:00",
          lunch_start: "12:00",
          lunch_end: "13:00",
          is_active: false,
        }),
      );
      expect(responseBody.barber.created_at).toBeDefined();
      expect(responseBody.barber.updated_at).toBeDefined();
      expect(responseBody.cancelled_appointments_count).toBeDefined();
    });

    test("Soft-deleted barber no longer appears in GET /api/v1/barbers", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber vanishes from list",
        isActive: true,
      });

      const deleteResponse = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(deleteResponse.status).toBe(200);

      const getResponse = await fetch(`${webserver.origin}/api/v1/barbers`);
      expect(getResponse.status).toBe(200);

      const barbers = await getResponse.json();
      const barberIds = barbers.map((b) => b.barber_id);
      expect(barberIds).not.toContain(barber.barberId);
    });

    test("Barber row still exists in database with isActive = false", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber still in DB",
        isActive: true,
      });

      const deleteResponse = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(deleteResponse.status).toBe(200);

      const dbBarber = await db.barber.findUnique({
        where: { barberId: barber.barberId },
        select: { barberId: true, barberName: true, isActive: true },
      });

      expect(dbBarber).not.toBeNull();
      expect(dbBarber.barberId).toBe(barber.barberId);
      expect(dbBarber.barberName).toBe("Barber still in DB");
      expect(dbBarber.isActive).toBe(false);
    });

    test("Deleting an already inactive barber is idempotent (200)", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Already inactive barber",
        isActive: false,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.barber).toEqual(
        expect.objectContaining({
          barber_id: barber.barberId,
          barber_name: "Already inactive barber",
          is_active: false,
        }),
      );
      expect(responseBody.cancelled_appointments_count).toBe(0);
    });

    test("Nonexistent valid barber_id (404)", async () => {
      const fakeUuid = "00000000-0000-4000-a000-000000000000";

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${fakeUuid}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("NotFoundError");
    });

    test("Invalid barber_id format (400)", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/not-a-uuid`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("ValidationError");
    });

    // ── Linked user ───────────────────────────────────────────────────────

    test("Linked user is also deactivated", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber with linked user",
      });

      const linkedUser = await orchestrator.createUser({
        accessLevel: "barber",
        linkedBarberId: barber.barberId,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const dbUser = await db.user.findUnique({
        where: { userId: linkedUser.userId },
        select: { userId: true, isActive: true },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser.isActive).toBe(false);
    });

    test("Barber deletion succeeds when no linked user exists", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber without user",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.barber.is_active).toBe(false);
    });

    // ── Appointment cancellation ──────────────────────────────────────────

    test("Future AGENDADO appointments are cancelled", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber with future appt",
      });

      const client = await orchestrator.createClient({
        clientName: "Client A",
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + 30);

      const appointment = await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: tomorrow,
        appointmentEndDatetime: tomorrowEnd,
        totalDuration: 30,
        status: "AGENDADO",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.cancelled_appointments_count).toBeGreaterThanOrEqual(
        1,
      );

      const dbAppointment = await db.appointment.findUnique({
        where: { appointmentId: appointment.appointmentId },
        select: { status: true },
      });

      expect(dbAppointment.status).toBe("CANCELADO");
    });

    test("Past AGENDADO appointments are NOT cancelled", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber with past appt",
      });

      const client = await orchestrator.createClient({
        clientName: "Client B",
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(10, 0, 0, 0);

      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setMinutes(yesterdayEnd.getMinutes() + 30);

      const pastAppointment = await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: yesterday,
        appointmentEndDatetime: yesterdayEnd,
        totalDuration: 30,
        status: "AGENDADO",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const dbAppointment = await db.appointment.findUnique({
        where: { appointmentId: pastAppointment.appointmentId },
        select: { status: true },
      });

      expect(dbAppointment.status).toBe("AGENDADO");
    });

    test("Appointments from other barbers are NOT cancelled", async () => {
      const barberA = await orchestrator.createBarber({
        barberName: "Barber A (deleted)",
      });

      const barberB = await orchestrator.createBarber({
        barberName: "Barber B (untouched)",
      });

      const client = await orchestrator.createClient({
        clientName: "Client C",
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + 30);

      const barberBAppointment = await orchestrator.createAppointment({
        barberId: barberB.barberId,
        clientId: client.clientId,
        appointmentDatetime: tomorrow,
        appointmentEndDatetime: tomorrowEnd,
        totalDuration: 30,
        status: "AGENDADO",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barberA.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const dbAppointment = await db.appointment.findUnique({
        where: { appointmentId: barberBAppointment.appointmentId },
        select: { status: true },
      });

      expect(dbAppointment.status).toBe("AGENDADO");
    });

    test("CONCLUIDO, FALTOU, and CANCELADO appointments are NOT modified", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber with various statuses",
      });

      const client = await orchestrator.createClient({
        clientName: "Client D",
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      function makeFutureTime(hour) {
        const dt = new Date(tomorrow);
        dt.setHours(hour, 0, 0, 0);
        const dtEnd = new Date(dt);
        dtEnd.setMinutes(dtEnd.getMinutes() + 30);
        return { start: dt, end: dtEnd };
      }

      const time1 = makeFutureTime(9);
      const time2 = makeFutureTime(11);
      const time3 = makeFutureTime(15);

      const concluidoAppt = await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: time1.start,
        appointmentEndDatetime: time1.end,
        totalDuration: 30,
        status: "CONCLUIDO",
      });

      const faltouAppt = await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: time2.start,
        appointmentEndDatetime: time2.end,
        totalDuration: 30,
        status: "FALTOU",
      });

      const canceladoAppt = await orchestrator.createAppointment({
        barberId: barber.barberId,
        clientId: client.clientId,
        appointmentDatetime: time3.start,
        appointmentEndDatetime: time3.end,
        totalDuration: 30,
        status: "CANCELADO",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const dbConcluido = await db.appointment.findUnique({
        where: { appointmentId: concluidoAppt.appointmentId },
        select: { status: true },
      });
      expect(dbConcluido.status).toBe("CONCLUIDO");

      const dbFaltou = await db.appointment.findUnique({
        where: { appointmentId: faltouAppt.appointmentId },
        select: { status: true },
      });
      expect(dbFaltou.status).toBe("FALTOU");

      const dbCancelado = await db.appointment.findUnique({
        where: { appointmentId: canceladoAppt.appointmentId },
        select: { status: true },
      });
      expect(dbCancelado.status).toBe("CANCELADO");
    });
  });
});
