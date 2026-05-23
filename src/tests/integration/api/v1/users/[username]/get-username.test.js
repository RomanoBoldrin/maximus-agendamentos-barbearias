import webserver from "@/infra/webserver.mjs";
import orchestrator from "@/tests/orchestrator/orchestrator.mjs";

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const createdUser = await orchestrator.createUser({
        username: "SameCase",
      });

      const response = await fetch(`${webserver.origin}/api/v1/users/SameCase`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        userId: createdUser.userId,
        username: "SameCase",
        email: createdUser.email,
        accessLevel: createdUser.accessLevel,
        linkedBarberId: createdUser.linkedBarberId,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      });

      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const createdUser = await orchestrator.createUser({
        username: "DifferentCase",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/differentcase`,
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        userId: createdUser.userId,
        username: "DifferentCase",
        email: createdUser.email,
        accessLevel: createdUser.accessLevel,
        linkedBarberId: createdUser.linkedBarberId,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      });

      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/users/UsuarioInexistente`,
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Username not found.",
        action: "Verify if the typed username is correct.",
        status_code: 404,
      });
    });
  });
});
