import { prisma as db} from "@/infra/prisma.js";
import webserver from "@/infra/webserver.mjs";
import password from "@/infra/password";

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "bob",
          email: "mail.test@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        userId: responseBody.userId,
        username: "bob",
        email: "mail.test@test.com",
        accessLevel: "barber",
        linkedBarberId: null,
        isActive: true,
        createdAt: responseBody.createdAt,
        updatedAt: responseBody.updatedAt,
      });

      expect(responseBody.userId).toEqual(expect.any(String));
      expect(Date.parse(responseBody.createdAt)).not.toBeNaN();
      expect(Date.parse(responseBody.updatedAt)).not.toBeNaN();

      const userInDatabase = await db.user.findUnique({
        where: {
          email: "mail.test@test.com",
        },
      });

      expect(userInDatabase).not.toBeNull();

      expect(userInDatabase.username).toBe("bob");
      expect(userInDatabase.email).toBe("mail.test@test.com");
      expect(userInDatabase.accessLevel).toBe("barber");
      expect(userInDatabase.linkedBarberId).toBeNull();
      expect(userInDatabase.isActive).toBe(true);

      expect(userInDatabase.passwordHash).not.toBe("LOCAL_PASSWORD");
      expect(userInDatabase.passwordHash).toEqual(expect.any(String));

      const correctPasswordMatch = await password.compare(
        "LOCAL_PASSWORD",
        userInDatabase.passwordHash,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "WrongPassword",
        userInDatabase.passwordHash,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicado@maximus.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });

      const response2 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicado@maximus.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(400);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Use another value to perform this operation.",
        message: "The field informed is already being used.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicado",
          email: "usernameduplicado1@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });

      const response2 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicado",
          email: "usernameduplicado2@test.com",
          password: "LOCAL_PASSWORD",
          accessLevel: "barber",
        }),
      });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(400);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Use another value to perform this operation.",
        message: "The field informed is already being used.",
        status_code: 400,
      });
    });
  });
});
