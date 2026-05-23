import password from "@/infra/password.js";
import webserver from "@/infra/webserver.mjs";
import { prisma as db } from "@/infra/prisma.js";
import orchestrator from "@/tests/orchestrator/orchestrator.mjs";

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent `username`", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/users/UsuarioInexistente`,
        {
          method: "PATCH",
        },
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

    test("With duplicated 'username'", async () => {
      const createdUser1 = await orchestrator.createUser({
        username: "user1",
      });

      const createdUser2 = await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: createdUser1.username,
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Use another value to perform this operation.",
        message: "The field informed is already being used.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const createdUser1 = await orchestrator.createUser({
        email: "email1@test.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@test.com",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: createdUser1.email,
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Use another value to perform this operation.",
        message: "The field informed is already being used.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUser1",
        email: "uniqueUser1@test.com",
        password: "LOCAL_PASSWORD",
        accessLevel: "barber",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        userId: createdUser.userId,
        username: "uniqueUser2",
        email: "uniqueuser1@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: responseBody.updatedAt,
      });

      expect(responseBody.userId).toEqual(expect.any(String));
      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
      expect(responseBody.updatedAt > responseBody.createdAt).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueEmail1",
        email: "uniqueemail1@test.com",
        password: "LOCAL_PASSWORD",
        accessLevel: "barber",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@test.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        userId: createdUser.userId,
        username: "uniqueEmail1",
        email: "uniqueemail2@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: responseBody.updatedAt,
      });

      expect(responseBody.userId).toEqual(expect.any(String));
      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
      expect(responseBody.updatedAt > responseBody.createdAt).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "NewPassword1",
        email: "newpassword1@test.com",
        password: "NewPassword1",
        accessLevel: "barber",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "NewPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        userId: createdUser.userId,
        username: "NewPassword1",
        email: "newpassword1@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: responseBody.updatedAt,
      });

      expect(responseBody.userId).toEqual(expect.any(String));
      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
      expect(responseBody.updatedAt > responseBody.createdAt).toBe(true);

      const userInDatabase = await db.user.findUnique({
        where: {
          username: "NewPassword1",
        },
      });

      const correctPasswordMatch = await password.compare(
        "NewPassword2",
        userInDatabase.passwordHash,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "NewPassword1",
        userInDatabase.passwordHash,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
