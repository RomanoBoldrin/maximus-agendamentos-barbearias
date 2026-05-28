import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";

describe("POST /api/v1/barbers", () => {
  describe("Anonymous user", () => {
    test("Cannot create barber (401)", async () => {
      await orchestrator.clearDatabase();

      const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_name: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("UnauthorizedError");
    });
  });

  describe("Authenticated Barber user", () => {
    test("Cannot create barber (403)", async () => {
      const barberUser = await orchestrator.createUser({
        accessLevel: "barber",
      });
      const session = await orchestrator.createSession(barberUser.userId);

      const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
        body: JSON.stringify({
          barber_name: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("ForbiddenError");
    });
  });

  describe("Authenticated Admin user", () => {
    let adminSessionToken;

    beforeAll(async () => {
      await orchestrator.clearDatabase();
      const adminUser = await orchestrator.createUser({ accessLevel: "admin" });
      const session = await orchestrator.createSession(adminUser.userId);
      adminSessionToken = session.token;
    });

    test("Can create barber (201)", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${adminSessionToken}`,
        },
        body: JSON.stringify({
          barber_name: "Elias",
          phone_number: "15999999999",
          work_start: "08:00",
          work_end: "18:00",
          lunch_start: "12:00",
          lunch_end: "13:00",
          username: "elias",
          email: "elias@maximus.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();

      expect(responseBody.barber).toBeDefined();
      expect(responseBody.user).toBeDefined();

      expect(responseBody.barber.barber_name).toBe("Elias");
      expect(responseBody.barber.phone_number).toBe("15999999999");
      expect(responseBody.barber.work_start).toBe("08:00");
      expect(responseBody.barber.lunch_end).toBe("13:00");
      expect(responseBody.barber.is_active).toBe(true);

      expect(responseBody.user.username).toBe("elias");
      expect(responseBody.user.email).toBe("elias@maximus.com");
      expect(responseBody.user.access_level).toBe("barber");
      expect(responseBody.user.linked_barber_id).toBe(
        responseBody.barber.barber_id,
      );
      expect(responseBody.user.is_active).toBe(true);

      // Verify passwordHash is not exposed
      expect(responseBody.user.passwordHash).toBeUndefined();
      expect(responseBody.user.password_hash).toBeUndefined();
      expect(responseBody.user.password).toBeUndefined();
    });

    test("Created barber is returned by GET /api/v1/barbers", async () => {
      const postResponse = await fetch(`${webserver.origin}/api/v1/barbers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${adminSessionToken}`,
        },
        body: JSON.stringify({
          barber_name: "Test Barber GET",
          username: "testbarberget",
          email: "testbarberget@maximus.com",
          password: "password123",
        }),
      });

      expect(postResponse.status).toBe(201);
      const postBody = await postResponse.json();
      const newBarberId = postBody.barber.barber_id;

      const getResponse = await fetch(`${webserver.origin}/api/v1/barbers`);
      expect(getResponse.status).toBe(200);
      const getBody = await getResponse.json();

      const foundBarber = getBody.find((b) => b.barber_id === newBarberId);
      expect(foundBarber).toBeDefined();
      expect(foundBarber.barber_name).toBe("Test Barber GET");
    });

    describe("Validation errors", () => {
      test("Missing barber_name (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            username: "user1",
            email: "user1@example.com",
            password: "password123",
          }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.name).toBe("ValidationError");
      });

      test("Missing username (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "User 2",
            email: "user2@example.com",
            password: "password123",
          }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.name).toBe("ValidationError");
      });

      test("Missing email (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "User 3",
            username: "user3",
            password: "password123",
          }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.name).toBe("ValidationError");
      });

      test("Missing password (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "User 4",
            username: "user4",
            email: "user4@example.com",
          }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.name).toBe("ValidationError");
      });

      test("Duplicate username (400)", async () => {
        // First create a barber
        await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "User 5",
            username: "user5",
            email: "user5@example.com",
            password: "password123",
          }),
        });

        // Try to create another barber with same username
        const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "User 5 Duplicate",
            username: "user5", // Duplicate
            email: "user5_dup@example.com",
            password: "password123",
          }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.name).toBe("ValidationError");
        expect(body.message).toContain("already being used");
      });

      test("Duplicate email (400)", async () => {
        // Try to create another barber with same email as user5
        const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "User 6 Duplicate",
            username: "user6",
            email: "user5@example.com", // Duplicate from previous test
            password: "password123",
          }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.name).toBe("ValidationError");
        expect(body.message).toContain("already being used");
      });

      test("Invalid time format (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "User 7",
            username: "user7",
            email: "user7@example.com",
            password: "password123",
            work_start: "8:00 AM", // Invalid format
            work_end: "18:00",
          }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.name).toBe("ValidationError");
        expect(body.message).toContain("Formato de hora");
      });

      test("Missing paired time field (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/barbers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            barber_name: "User 8",
            username: "user8",
            email: "user8@example.com",
            password: "password123",
            work_start: "08:00", // Missing work_end
          }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.name).toBe("ValidationError");
        expect(body.message).toContain("início e o fim");
      });
    });
  });
});
