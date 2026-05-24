import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import webserver from "@/infra/webserver.mjs";
import session from "@/infra/session";

const endPoint = "sessions";

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email`, but correct `password`", async () => {
      await orchestrator.createUser({
        password: "senha_correta",
      });

      const response = await fetch(`${webserver.origin}/api/v1/${endPoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.wrong@test.com",
          password: "senha_correta",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action: "Check your credentials and try again.",
        status_code: 401,
      });
    });

    test("With correct `email`, but incorrect `password`", async () => {
      await orchestrator.createUser({
        email: "email.correct@test.com",
      });

      const response = await fetch(`${webserver.origin}/api/v1/${endPoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correct@test.com",
          password: "wrong_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action: "Check your credentials and try again.",
        status_code: 401,
      });
    });

    test("With incorrect `email` and `password`", async () => {
      await orchestrator.createUser({
        email: "email.wrong@test.com",
        password: "wrong_password",
      });

      const response = await fetch(`${webserver.origin}/api/v1/${endPoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correct@test.com",
          password: "correct_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action: "Check your credentials and try again.",
        status_code: 401,
      });
    });

    test("With correct `email` and `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "email.eveythingcorrect@test.com",
        password: "everything_correct_password",
      });

      const response = await fetch(`${webserver.origin}/api/v1/${endPoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.eveythingcorrect@test.com",
          password: "everything_correct_password",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        session_id: responseBody.session_id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        user: {
          user_id: createdUser.userId,
          username: createdUser.username,
          email: "email.eveythingcorrect@test.com",
          access_level: createdUser.accessLevel,
          linked_barber_id: null,
          is_active: true,
          created_at: responseBody.user.created_at,
          updated_at: responseBody.user.updated_at,
        },
      });

      // Checks for the responseBody
      expect(uuidVersion(responseBody.user.user_id)).toBe(4);
      expect(responseBody.session_id).toEqual(expect.any(String));
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.user.user_id).toEqual(expect.any(String));
      expect(Date.parse(responseBody.user.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.user.updated_at)).not.toBeNaN();

      // Checks if the expires_at date is greater than the created_at date (expect true)
      const expires_at = new Date(responseBody.expires_at);
      const created_at = new Date(responseBody.created_at);

      expires_at.setMilliseconds(0);
      created_at.setMilliseconds(0);

      expect(expires_at - created_at).toBe(
        session.SESSION_DURATION_IN_MILLISECONDS,
      );

      // Checks the Cookie properties
      const setCookieHeader = response.headers.get("set-cookie");

      expect(setCookieHeader).toEqual(expect.any(String));

      const parsedSetCookie = setCookieParser.parse(setCookieHeader, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: parsedSetCookie.session_id.value,
        maxAge: session.SESSION_DURATION_IN_SECONDS,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });

      expect(parsedSetCookie.session_id.value).toEqual(expect.any(String));
    });
  });
});
