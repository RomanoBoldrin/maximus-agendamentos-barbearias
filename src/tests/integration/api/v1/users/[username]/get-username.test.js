import webserver from "@/infra/webserver.mjs";

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const response1 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "SameCase",
          email: "samecase@test.com",
          password: "SehrSicheresPasswort",
          accessLevel: "barber",
        }),
      });

      expect(response1.status).toBe(201);

      const response1Body = await response1.json();

      const response2 = await fetch(
        `${webserver.origin}/api/v1/users/SameCase`,
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        userId: response1Body.userId,
        username: "SameCase",
        email: "samecase@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: response1Body.createdAt,
        updatedAt: response1Body.updatedAt,
      });

      expect(Date.parse(response2Body.createdAt)).not.toBeNaN();
      expect(Date.parse(response2Body.updatedAt)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const response1 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "DifferentCase",
          email: "differentcase@test.com",
          password: "SehrSicheresPasswort",
          accessLevel: "barber",
        }),
      });

      expect(response1.status).toBe(201);

      const response1Body = await response1.json();

      const response2 = await fetch(
        `${webserver.origin}/api/v1/users/differentcase`,
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        userId: response1Body.userId,
        username: "DifferentCase",
        email: "differentcase@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: response1Body.createdAt,
        updatedAt: response1Body.updatedAt,
      });

      expect(Date.parse(response2Body.createdAt)).not.toBeNaN();
      expect(Date.parse(response2Body.updatedAt)).not.toBeNaN();
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
