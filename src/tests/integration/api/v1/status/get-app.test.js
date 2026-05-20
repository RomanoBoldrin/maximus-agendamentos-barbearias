import webserver from "@/infra/webserver.mjs";

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect([100, 901]).toContain(
        responseBody.dependencies.database.max_connections,
      );
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
      expect(responseBody.dependencies.database.version.startsWith("18")).toBe(
        true,
      );
    });
  });
});
