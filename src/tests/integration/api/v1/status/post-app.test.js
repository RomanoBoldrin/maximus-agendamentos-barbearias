import webserver from "@/infra/webserver.mjs";
import { MethodNotAllowedError } from "@/infra/errors";

describe("POST /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        method: "POST",
      });
      expect(response.status).toBe(405);

      const responseBody = await response.json();
      const notAllowedErrorResponseBody = new MethodNotAllowedError().toJSON();

      expect(responseBody).toEqual(notAllowedErrorResponseBody);
    });
  });
});
