import crypto from "node:crypto";

import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import session from "@/infra/session.js";
import webserver from "@/infra/webserver.mjs";

describe("DELETE /api/v1/sessions", () => {
  describe("Default user", () => {
    test("With nonexistent session", async () => {
      const nonexistentToken = crypto.randomBytes(48).toString("hex");

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid or expired session.",
        action: "Login to continue.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.SESSION_DURATION_IN_MILLISECONDS - 1000,
        ),
      });

      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(
        createdUser.userId,
      );

      jest.useRealTimers();

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid or expired session.",
        action: "Login to continue.",
        status_code: 401,
      });
    });

    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(
        createdUser.userId,
      );

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        session_id: sessionObject.session.sessionId,
        user_id: createdUser.userId,
        expires_at: responseBody.expires_at,
        created_at: sessionObject.session.createdAt.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.session_id)).toBe(4);
      expect(uuidVersion(responseBody.user_id)).toBe(4);

      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(new Date(responseBody.expires_at).getTime()).toBeLessThan(
        sessionObject.session.expiresAt.getTime(),
      );

      expect(
        new Date(responseBody.updated_at).getTime(),
      ).toBeGreaterThanOrEqual(sessionObject.session.updatedAt.getTime());

      const setCookieHeader = response.headers.get("set-cookie");

      expect(setCookieHeader).toEqual(expect.any(String));

      const parsedSetCookie = setCookieParser.parse(setCookieHeader, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual(
        expect.objectContaining({
          name: "session_id",
          value: "invalid",
          maxAge: -1,
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
        }),
      );

      const doubleCheckResponse = await fetch(
        `${webserver.origin}/api/v1/user`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(doubleCheckResponse.status).toBe(401);

      const doubleCheckResponseBody = await doubleCheckResponse.json();

      expect(doubleCheckResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid or expired session.",
        action: "Login to continue.",
        status_code: 401,
      });
    });
  });
});
