import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";
import { prisma as db } from "@/infra/prisma.js";

describe("DELETE /api/v1/services/[service_id]", () => {
  describe("Anonymous user", () => {
    test("Cannot delete service (401)", async () => {
      await orchestrator.clearDatabase();

      const service = await orchestrator.createService({
        serviceName: "Service to delete",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
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
    test("Cannot delete service (403)", async () => {
      const barberUser = await orchestrator.createUser({
        accessLevel: "barber",
      });
      const session = await orchestrator.createSession(barberUser.userId);

      const service = await orchestrator.createService({
        serviceName: "Service barber cannot delete",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
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

    test("Can soft-delete an active service (200)", async () => {
      const service = await orchestrator.createService({
        serviceName: "Service to soft-delete",
        serviceDescription: "Will be deactivated",
        duration: 30,
        price: 50,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          service_id: service.serviceId,
          service_name: "Service to soft-delete",
          service_description: "Will be deactivated",
          duration: 30,
          price: "50.00",
          is_active: false,
        }),
      );
      expect(responseBody.created_at).toBeDefined();
      expect(responseBody.updated_at).toBeDefined();
    });

    test("Soft-deleted service no longer appears in GET /api/v1/services", async () => {
      const service = await orchestrator.createService({
        serviceName: "Service that will vanish from list",
        isActive: true,
      });

      // Soft-delete it
      const deleteResponse = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(deleteResponse.status).toBe(200);

      // Verify it does not appear in the public list
      const getResponse = await fetch(`${webserver.origin}/api/v1/services`);
      expect(getResponse.status).toBe(200);

      const services = await getResponse.json();
      const serviceIds = services.map((s) => s.service_id);
      expect(serviceIds).not.toContain(service.serviceId);
    });

    test("Service row still exists in database with isActive = false", async () => {
      const service = await orchestrator.createService({
        serviceName: "Service still in DB",
        isActive: true,
      });

      // Soft-delete it
      const deleteResponse = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(deleteResponse.status).toBe(200);

      // Verify the row still exists in the database
      const dbService = await db.service.findUnique({
        where: { serviceId: service.serviceId },
        select: {
          serviceId: true,
          serviceName: true,
          isActive: true,
        },
      });

      expect(dbService).not.toBeNull();
      expect(dbService.serviceId).toBe(service.serviceId);
      expect(dbService.serviceName).toBe("Service still in DB");
      expect(dbService.isActive).toBe(false);
    });

    test("Deleting an already inactive service is idempotent (200)", async () => {
      const service = await orchestrator.createService({
        serviceName: "Already inactive",
        isActive: false,
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${service.serviceId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${adminSessionToken}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          service_id: service.serviceId,
          service_name: "Already inactive",
          is_active: false,
        }),
      );
    });

    test("Nonexistent valid service_id (404)", async () => {
      const fakeUuid = "00000000-0000-4000-a000-000000000000";

      const response = await fetch(
        `${webserver.origin}/api/v1/services/${fakeUuid}`,
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

    test("Invalid service_id format (400)", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/services/not-a-uuid`,
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
  });
});
