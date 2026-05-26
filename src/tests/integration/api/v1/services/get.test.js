import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";

describe("GET /api/v1/services", () => {
  describe("Anonymous user", () => {
    test("With empty services list", async () => {
      await orchestrator.clearDatabase();

      const response = await fetch(`${webserver.origin}/api/v1/services`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual([]);
    });

    test("With active services", async () => {
      const createdService1 = await orchestrator.createService({
        serviceName: "Haircut",
        serviceDescription: "Basic haircut",
        duration: 30,
        price: 50,
      });

      const createdService2 = await orchestrator.createService({
        serviceName: "Beard Trim",
        serviceDescription: "Professional beard trim",
        duration: 20,
        price: 30,
      });

      const response = await fetch(`${webserver.origin}/api/v1/services`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const returnedServiceIds = responseBody.map(
        (service) => service.service_id,
      );

      expect(returnedServiceIds).toContain(createdService1.serviceId);
      expect(returnedServiceIds).toContain(createdService2.serviceId);

      const returnedService1 = responseBody.find(
        (service) => service.service_id === createdService1.serviceId,
      );

      const returnedService2 = responseBody.find(
        (service) => service.service_id === createdService2.serviceId,
      );

      expect(returnedService1).toEqual({
        service_id: createdService1.serviceId,
        service_name: "Haircut",
        service_description: "Basic haircut",
        duration: 30,
        price: "50.00",
        is_active: true,
        created_at: createdService1.createdAt.toISOString(),
        updated_at: createdService1.updatedAt.toISOString(),
      });

      expect(returnedService2).toEqual({
        service_id: createdService2.serviceId,
        service_name: "Beard Trim",
        service_description: "Professional beard trim",
        duration: 20,
        price: "30.00",
        is_active: true,
        created_at: createdService2.createdAt.toISOString(),
        updated_at: createdService2.updatedAt.toISOString(),
      });
    });

    test("With inactive services excluded", async () => {
      const activeService = await orchestrator.createService({
        serviceName: "Active Service",
        isActive: true,
      });

      const inactiveService = await orchestrator.createService({
        serviceName: "Inactive Service",
        isActive: false,
      });

      const response = await fetch(`${webserver.origin}/api/v1/services`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const returnedServiceIds = responseBody.map(
        (service) => service.service_id,
      );

      expect(returnedServiceIds).toContain(activeService.serviceId);
      expect(returnedServiceIds).not.toContain(inactiveService.serviceId);

      const returnedActiveService = responseBody.find(
        (service) => service.service_id === activeService.serviceId,
      );

      expect(returnedActiveService).toEqual(
        expect.objectContaining({
          service_id: activeService.serviceId,
          service_name: "Active Service",
          is_active: true,
        }),
      );
    });

    test("Price is serialized as string", async () => {
      const createdService = await orchestrator.createService({
        serviceName: "Premium Service",
        price: 99.99,
      });

      const response = await fetch(`${webserver.origin}/api/v1/services`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const returnedService = responseBody.find(
        (service) => service.service_id === createdService.serviceId,
      );

      expect(returnedService).toBeDefined();
      expect(returnedService.price).toBe("99.99");
      expect(typeof returnedService.price).toBe("string");
    });
  });
});
