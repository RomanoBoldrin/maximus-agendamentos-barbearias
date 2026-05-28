import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";

describe("POST /api/v1/services", () => {
  describe("Anonymous user", () => {
    test("Cannot create service (401)", async () => {
      await orchestrator.clearDatabase();

      const response = await fetch(`${webserver.origin}/api/v1/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_name: "Corte Teste",
          duration: 30,
          price: 50,
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("UnauthorizedError");
    });
  });

  describe("Authenticated Barber user", () => {
    test("Cannot create service (403)", async () => {
      const barberUser = await orchestrator.createUser({
        accessLevel: "barber",
      });
      const session = await orchestrator.createSession(barberUser.userId);

      const response = await fetch(`${webserver.origin}/api/v1/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
        body: JSON.stringify({
          service_name: "Corte Teste",
          duration: 30,
          price: 50,
        }),
      });

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("ForbiddenError");
    });
  });

  describe("Authenticated Admin user", () => {
    test("Can create service (201)", async () => {
      const adminUser = await orchestrator.createUser({ accessLevel: "admin" });
      const session = await orchestrator.createSession(adminUser.userId);

      const response = await fetch(`${webserver.origin}/api/v1/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
        body: JSON.stringify({
          service_name: "Corte de cabelo",
          service_description: "Corte masculino tradicional",
          duration: 30,
          price: 50.0,
        }),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          service_name: "Corte de cabelo",
          service_description: "Corte masculino tradicional",
          duration: 30,
          price: "50.00",
          is_active: true,
        }),
      );
      expect(responseBody.service_id).toBeDefined();
      expect(responseBody.created_at).toBeDefined();
      expect(responseBody.updated_at).toBeDefined();
    });

    describe("Validation errors", () => {
      let adminSessionToken;

      beforeAll(async () => {
        const adminUser = await orchestrator.createUser({
          accessLevel: "admin",
        });
        const session = await orchestrator.createSession(adminUser.userId);
        adminSessionToken = session.token;
      });

      test("Missing service_name (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            duration: 30,
            price: 50.0,
          }),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.name).toEqual("ValidationError");
      });

      test("Empty service_name (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "   ",
            duration: 30,
            price: 50.0,
          }),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.name).toEqual("ValidationError");
      });

      test("Missing duration (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "Corte",
            price: 50.0,
          }),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.name).toEqual("ValidationError");
      });

      test("Invalid duration (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "Corte",
            duration: -10,
            price: 50.0,
          }),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.name).toEqual("ValidationError");
      });

      test("Missing price (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "Corte",
            duration: 30,
          }),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.name).toEqual("ValidationError");
      });

      test("Invalid price (400)", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "Corte",
            duration: 30,
            price: -50.0,
          }),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.name).toEqual("ValidationError");
      });
    });

    test("Created service appears in GET /api/v1/services", async () => {
      const adminUser = await orchestrator.createUser({ accessLevel: "admin" });
      const session = await orchestrator.createSession(adminUser.userId);

      const postResponse = await fetch(`${webserver.origin}/api/v1/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${session.token}`,
        },
        body: JSON.stringify({
          service_name: "Servico de Teste",
          duration: 45,
          price: 75.5,
        }),
      });

      expect(postResponse.status).toBe(201);
      const postResponseBody = await postResponse.json();
      const createdId = postResponseBody.service_id;

      const getResponse = await fetch(`${webserver.origin}/api/v1/services`);
      expect(getResponse.status).toBe(200);
      const getResponseBody = await getResponse.json();

      const foundService = getResponseBody.find(
        (s) => s.service_id === createdId,
      );
      expect(foundService).toBeDefined();
      expect(foundService.service_name).toBe("Servico de Teste");
      expect(foundService.duration).toBe(45);
      expect(foundService.price).toBe("75.50");
    });
  });
});
