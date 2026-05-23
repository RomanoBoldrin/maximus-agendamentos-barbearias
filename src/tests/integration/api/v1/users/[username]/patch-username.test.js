import password from "@/infra/password";
import webserver from "@/infra/webserver.mjs";
import { prisma as db } from "@/infra/prisma.js";

describe("GET /api/v1/users/[username]", () => {
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
      const user1response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });
      expect(user1response.status).toBe(201);

      const user2response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });
      expect(user2response.status).toBe(201);

      const response = await fetch(`${webserver.origin}/api/v1/users/user2`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });
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
      const email1response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });
      expect(email1response.status).toBe(201);

      const email2response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });
      expect(email2response.status).toBe(201);

      const response = await fetch(`${webserver.origin}/api/v1/users/email2`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email1@test.com",
        }),
      });
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
      const user1response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueUser1@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });
      expect(user1response.status).toBe(201);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/uniqueUser1`,
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
        userId: responseBody.userId,
        username: "uniqueUser2",
        email: "uniqueuser1@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: responseBody.createdAt,
        updatedAt: responseBody.updatedAt,
      });

      expect(responseBody.userId).toEqual(expect.any(String));
      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
      expect(responseBody.updatedAt > responseBody.createdAt).toBe(true);
    });

    test("With unique 'email'", async () => {
      const user1response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail1",
          email: "uniqueemail1@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });
      expect(user1response.status).toBe(201);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/uniqueEmail1`,
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
        userId: responseBody.userId,
        username: "uniqueEmail1",
        email: "uniqueemail2@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: responseBody.createdAt,
        updatedAt: responseBody.updatedAt,
      });

      expect(responseBody.userId).toEqual(expect.any(String));
      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();
      expect(responseBody.updatedAt > responseBody.createdAt).toBe(true);
    });

    test("With new 'password'", async () => {
      const userResponse = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "NewPassword1",
          email: "newpassword1@test.com",
          password: "NewPassword1",
          accessLevel: "barber",
        }),
      });
      expect(userResponse.status).toBe(201);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/NewPassword1`,
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
        userId: responseBody.userId,
        username: "NewPassword1",
        email: "newpassword1@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: responseBody.createdAt,
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
