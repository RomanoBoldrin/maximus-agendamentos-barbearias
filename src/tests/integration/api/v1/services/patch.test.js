import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";

describe("PATCH /api/v1/services/[service_id]", () => {
  describe("Anonymous user", () => {
    test("Cannot patch service (401)", async () => {
      await orchestrator.clearDatabase();

      const service = await orchestrator.createService({
        serviceName: "Service to patch",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_name: "New Name",
          }),
        }
      );

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("UnauthorizedError");
    });
  });

  describe("Authenticated Barber user", () => {
    test("Cannot patch service (403)", async () => {
      const barberUser = await orchestrator.createUser({
        accessLevel: "barber",
      });
      const session = await orchestrator.createSession(barberUser.userId);

      const service = await orchestrator.createService({
        serviceName: "Service barber cannot patch",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${session.token}`,
          },
          body: JSON.stringify({
            service_name: "New Name",
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

    test("Can update only service_name", async () => {
      const service = await orchestrator.createService({
        serviceName: "Old Name",
        serviceDescription: "Old description",
        duration: 30,
        price: 50,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "New Name",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.service_name).toBe("New Name");
      expect(responseBody.service_description).toBe("Old description");
      expect(responseBody.duration).toBe(30);
      expect(responseBody.price).toBe("50.00");
      expect(responseBody.updated_at).not.toBe(service.updatedAt.toISOString());
    });

    test("Can update only service_description", async () => {
      const service = await orchestrator.createService({
        serviceName: "My Service",
        serviceDescription: "Old description",
        duration: 30,
        price: 50,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_description: "New description",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.service_name).toBe("My Service");
      expect(responseBody.service_description).toBe("New description");
    });

    test("Can update only duration", async () => {
      const service = await orchestrator.createService({
        serviceName: "My Service",
        duration: 30,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            duration: 45,
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.duration).toBe(45);
    });

    test("Can update only price", async () => {
      const service = await orchestrator.createService({
        serviceName: "My Service",
        price: 50,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            price: 75.5,
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.price).toBe("75.50");
    });

    test("Can update multiple fields", async () => {
      const service = await orchestrator.createService({
        serviceName: "Old Name",
        serviceDescription: "Old description",
        duration: 30,
        price: 50,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "New Name",
            duration: 60,
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.service_name).toBe("New Name");
      expect(responseBody.service_description).toBe("Old description");
      expect(responseBody.duration).toBe(60);
      expect(responseBody.price).toBe("50.00");
    });

    test("Omitted fields are preserved", async () => {
      const service = await orchestrator.createService({
        serviceName: "Preserved Name",
        serviceDescription: "Preserved Desc",
        duration: 45,
        price: 60,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "Preserved Name Updated",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.service_description).toBe("Preserved Desc");
      expect(responseBody.duration).toBe(45);
      expect(responseBody.price).toBe("60.00");
    });

    test("Empty body returns 400", async () => {
      const service = await orchestrator.createService({
        serviceName: "Service",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
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

    test("Inactive/soft-deleted service cannot be patched (404)", async () => {
      const service = await orchestrator.createService({
        serviceName: "Inactive Service",
        isActive: false,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "Try Update",
          }),
        }
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody.name).toEqual("NotFoundError");
    });

    test("Response shape matches existing service API conventions", async () => {
      const service = await orchestrator.createService({
        serviceName: "Test shape",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${adminSessionToken}`,
          },
          body: JSON.stringify({
            service_name: "Updated shape",
          }),
        }
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          service_id: service.serviceId,
          service_name: "Updated shape",
          is_active: true,
        })
      );
      expect(responseBody.created_at).toBeDefined();
      expect(responseBody.updated_at).toBeDefined();
      expect(responseBody.service_description).toBeDefined(); // can be null
      expect(responseBody.duration).toBeDefined();
      expect(responseBody.price).toBeDefined();
    });
  });
});
