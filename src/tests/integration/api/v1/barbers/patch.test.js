import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";

describe("PATCH /api/v1/barbers/[barber_id]", () => {
  describe("Anonymous user", () => {
    test("Cannot patch barber (401)", async () => {
      await orchestrator.clearDatabase();

      const barber = await orchestrator.createBarber({
        barberName: "Barber to patch",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            barber_name: "New Name",
          }),
        }
      );

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("UnauthorizedError");
    });
  });

  describe("Authenticated Barber user", () => {
    test("Cannot patch barber (403)", async () => {
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
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
          body: JSON.stringify({
            barber_name: "New Name",
          }),
        }
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

    test("Can update only barber_name", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Old Name",
        phoneNumber: "11999999999",
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "New Name",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.barber_name).toBe("New Name");
      expect(responseBody.phone_number).toBe("11999999999");
      expect(responseBody.work_start).toBe("08:00");
      expect(responseBody.work_end).toBe("18:00");
      expect(responseBody.lunch_start).toBe("12:00");
      expect(responseBody.lunch_end).toBe("13:00");
    });

    test("Can update only phone_number", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "My Barber",
        phoneNumber: "11999999999",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            phone_number: "22888888888",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.barber_name).toBe("My Barber");
      expect(responseBody.phone_number).toBe("22888888888");
    });

    test("Can update only work_start/work_end", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "My Barber",
        workStart: "08:00",
        workEnd: "18:00",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            work_start: "09:00",
            work_end: "17:00",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.work_start).toBe("09:00");
      expect(responseBody.work_end).toBe("17:00");
    });

    test("Can update only lunch_start/lunch_end", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "My Barber",
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            lunch_start: "13:00",
            lunch_end: "14:00",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.lunch_start).toBe("13:00");
      expect(responseBody.lunch_end).toBe("14:00");
    });

    test("Can update multiple profile fields", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Old Barber",
        phoneNumber: "11999999999",
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "New Barber",
            phone_number: "22888888888",
            work_start: "10:00",
            work_end: "20:00",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.barber_name).toBe("New Barber");
      expect(responseBody.phone_number).toBe("22888888888");
      expect(responseBody.work_start).toBe("10:00");
      expect(responseBody.work_end).toBe("20:00");
      expect(responseBody.lunch_start).toBe("12:00");
      expect(responseBody.lunch_end).toBe("13:00");
    });

    test("Omitted fields are preserved", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Preserved Barber",
        phoneNumber: "11999999999",
        workStart: "08:00",
        workEnd: "18:00",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "Preserved Barber Updated",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.barber_name).toBe("Preserved Barber Updated");
      expect(responseBody.phone_number).toBe("11999999999");
      expect(responseBody.work_start).toBe("08:00");
      expect(responseBody.work_end).toBe("18:00");
    });

    test("Empty body returns 400", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Empty Body Barber",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({}),
        }
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("ValidationError");
    });

    test("Inactive/soft-deleted barber cannot be patched (404)", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Inactive Barber",
        isActive: false,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "Try Update",
          }),
        }
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("NotFoundError");
    });

    test("User/account fields are ignored and not updated", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Barber with User",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "Barber Valid Name",
            username: "newusername",
            email: "newemail@example.com",
            password: "newpassword",
            access_level: "admin",
            is_active: false,
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.barber_name).toBe("Barber Valid Name");
      expect(responseBody.username).toBeUndefined();
      expect(responseBody.email).toBeUndefined();
      expect(responseBody.password).toBeUndefined();
      expect(responseBody.access_level).toBeUndefined();
      expect(responseBody.is_active).toBe(true); // Should not be affected by is_active: false
    });

    test("Response shape matches existing barber API conventions", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Shape Test Barber",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "Shape Test Barber Updated",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          barber_id: barber.barberId,
          barber_name: "Shape Test Barber Updated",
          is_active: true,
        })
      );
      expect(responseBody.created_at).toBeDefined();
      expect(responseBody.updated_at).toBeDefined();
      expect(responseBody.phone_number).toBeDefined(); // can be null
      expect(responseBody.work_start).toBeDefined(); // can be null
      expect(responseBody.work_end).toBeDefined(); // can be null
      expect(responseBody.lunch_start).toBeDefined(); // can be null
      expect(responseBody.lunch_end).toBeDefined(); // can be null
    });

    test("Fails if lunch_start is provided without lunch_end (400)", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Time Pair Test",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            lunch_start: "12:00",
          }),
        }
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("ValidationError");
    });

    test("Fails if lunch interval is outside work interval (400)", async () => {
      const barber = await orchestrator.createBarber({
        barberName: "Interval Limits Test",
        workStart: "09:00",
        workEnd: "18:00",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/barbers/${barber.barberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            lunch_start: "18:30",
            lunch_end: "19:30",
          }),
        }
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("ValidationError");
    });
  });
});
