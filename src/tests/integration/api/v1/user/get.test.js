import crypto from "node:crypto";

import * as cookie from "cookie";
import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

import webserver from "@/infra/webserver.mjs";
import session from "@/infra/session.js";
import { prisma as db } from "@/infra/prisma.js";
import orchestrator from "@/tests/orchestrator/orchestrator.mjs";

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(
        createdUser.userId,
      );

      const sessionBeforeRenewal = await db.session.update({
        where: {
          sessionId: sessionObject.session.sessionId,
        },
        data: {
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        },
        select: {
          sessionId: true,
          userId: true,
          updatedAt: true,
          expiresAt: true,
        },
      });

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        user_id: createdUser.userId,
        username: createdUser.username,
        email: createdUser.email,
        access_level: createdUser.accessLevel,
        linked_barber_id: createdUser.linkedBarberId,
        is_active: createdUser.isActive,
        created_at: createdUser.createdAt.toISOString(),
        updated_at: createdUser.updatedAt.toISOString(),
      });

      expect(uuidVersion(responseBody.user_id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const renewedSessionObject = await db.session.findUnique({
        where: {
          sessionId: sessionObject.session.sessionId,
        },
        select: {
          sessionId: true,
          userId: true,
          updatedAt: true,
          expiresAt: true,
        },
      });

      expect(renewedSessionObject.expiresAt.getTime()).toBeGreaterThan(
        sessionBeforeRenewal.expiresAt.getTime(),
      );

      expect(renewedSessionObject.updatedAt.getTime()).toBeGreaterThanOrEqual(
        sessionBeforeRenewal.updatedAt.getTime(),
      );

      const setCookieHeader = response.headers.get("set-cookie");

      expect(setCookieHeader).toEqual(expect.any(String));

      const parsedSetCookie = cookie.parse(setCookieHeader);

      expect(parsedSetCookie.session_id).toEqual(expect.any(String));
      expect(setCookieHeader).toContain("HttpOnly");
      expect(setCookieHeader).toContain("Path=/");
      expect(setCookieHeader).toContain(
        `Max-Age=${session.SESSION_DURATION_IN_SECONDS}`,
      );
      expect(setCookieHeader).toContain("SameSite=Lax");
    });

    test("With nonexistent session", async () => {
      const nonexistentToken = crypto.randomBytes(48).toString("hex");

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
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

    test("With session about to expire", async () => {
      const extraTime = 1000; // 1 second

      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.SESSION_DURATION_IN_MILLISECONDS + extraTime,
        ),
      });

      const createdUser = await orchestrator.createUser({
        username: "SessionAboutToBeInvalid",
      });

      const sessionObject = await orchestrator.createSession(
        createdUser.userId,
      );

      jest.useRealTimers();

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      // Check if caching is disabled for this endpoint
      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );
      expect(response.headers.get("cache-control")).toContain("no-store");

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        user_id: createdUser.userId,
        username: "SessionAboutToBeInvalid",
        email: createdUser.email,
        access_level: createdUser.accessLevel,
        linked_barber_id: createdUser.linkedBarberId,
        is_active: createdUser.isActive,
        created_at: createdUser.createdAt.toISOString(),
        updated_at: createdUser.updatedAt.toISOString(),
      });

      expect(uuidVersion(responseBody.user_id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const renewedSessionObject = await session.findValidSessionbyToken(
        sessionObject.token,
      );

      expect(renewedSessionObject).not.toBeNull();

      expect(renewedSessionObject.expiresAt.getTime()).toBeGreaterThan(
        sessionObject.session.expiresAt.getTime(),
      );

      expect(renewedSessionObject.updatedAt.getTime()).toBeGreaterThanOrEqual(
        sessionObject.session.updatedAt.getTime(),
      );

      const setCookieHeader = response.headers.get("set-cookie");

      expect(setCookieHeader).toEqual(expect.any(String));

      const parsedSetCookie = setCookieParser.parse(setCookieHeader, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual(
        expect.objectContaining({
          name: "session_id",
          value: sessionObject.token,
          maxAge: session.SESSION_DURATION_IN_SECONDS,
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
        }),
      );
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.SESSION_DURATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(
        createdUser.userId,
      );

      jest.useRealTimers();

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
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
  });
});
