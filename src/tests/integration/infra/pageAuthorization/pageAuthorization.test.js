import crypto from "node:crypto";

import orchestrator from "@/tests/orchestrator/orchestrator.mjs";
import session from "@/infra/session.js";
import pageAuthorization from "@/infra/pageAuthorization";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Builds a minimal Next.js GetServerSidePropsContext substitute that is
 * sufficient for pageAuthorization helpers. The real context object also
 * contains `params`, `query`, etc., but the helpers only touch `req` and `res`.
 */
function buildContext({ sessionToken } = {}) {
  const cookies = sessionToken ? { session_id: sessionToken } : {};

  return {
    req: { cookies },
    res: {
      // Capture Set-Cookie calls so tests can assert on them.
      _headers: {},
      setHeader(name, value) {
        this._headers[name.toLowerCase()] = value;
      },
      getHeader(name) {
        return this._headers[name.toLowerCase()];
      },
    },
  };
}

// ─── requireAdminPage ────────────────────────────────────────────────────────

describe("pageAuthorization.requireAdminPage()", () => {
  describe("Unauthenticated requests", () => {
    test("Returns notFound when no session cookie is present", async () => {
      const context = buildContext();

      const result = await pageAuthorization.requireAdminPage(context);

      expect(result).toEqual({ notFound: true });
    });

    test("Returns notFound for a nonexistent session token", async () => {
      const fakeToken = crypto.randomBytes(48).toString("hex");
      const context = buildContext({ sessionToken: fakeToken });

      const result = await pageAuthorization.requireAdminPage(context);

      expect(result).toEqual({ notFound: true });
    });

    test("Returns notFound for an expired session", async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.SESSION_DURATION_IN_MILLISECONDS - 1000,
        ),
      });

      const user = await orchestrator.createUser({ accessLevel: "admin" });
      const sessionObject = await orchestrator.createSession(user.userId);

      jest.useRealTimers();

      const context = buildContext({ sessionToken: sessionObject.token });

      const result = await pageAuthorization.requireAdminPage(context);

      expect(result).toEqual({ notFound: true });
    });
  });

  describe("Barber user", () => {
    test("Returns notFound even with a valid session", async () => {
      const barberUser = await orchestrator.createUser({
        accessLevel: "barber",
      });
      const sessionObject = await orchestrator.createSession(barberUser.userId);
      const context = buildContext({ sessionToken: sessionObject.token });

      const result = await pageAuthorization.requireAdminPage(context);

      expect(result).toEqual({ notFound: true });
    });
  });

  describe("Admin user", () => {
    test("Returns user object for a valid admin session", async () => {
      const admin = await orchestrator.createUser({ accessLevel: "admin" });
      const sessionObject = await orchestrator.createSession(admin.userId);
      const context = buildContext({ sessionToken: sessionObject.token });

      const result = await pageAuthorization.requireAdminPage(context);

      expect(result.notFound).toBeUndefined();
      expect(result.user).toMatchObject({
        userId: admin.userId,
        accessLevel: "admin",
      });
      // passwordHash must never appear
      expect(result.user.passwordHash).toBeUndefined();
    });

    test("Renews the session and sets Set-Cookie on the SSR response", async () => {
      const admin = await orchestrator.createUser({ accessLevel: "admin" });
      const sessionObject = await orchestrator.createSession(admin.userId);
      const context = buildContext({ sessionToken: sessionObject.token });

      await pageAuthorization.requireAdminPage(context);

      const setCookieHeader = context.res.getHeader("set-cookie");
      expect(typeof setCookieHeader).toBe("string");
      expect(setCookieHeader).toContain("session_id=");
      expect(setCookieHeader).toContain("HttpOnly");
    });
  });
});

// ─── requireAdminOrBarberPage ────────────────────────────────────────────────

describe("pageAuthorization.requireAdminOrBarberPage()", () => {
  describe("Unauthenticated requests", () => {
    test("Returns notFound when no session cookie is present", async () => {
      const context = buildContext();

      const result = await pageAuthorization.requireAdminOrBarberPage(context);

      expect(result).toEqual({ notFound: true });
    });

    test("Returns notFound for a nonexistent session token", async () => {
      const fakeToken = crypto.randomBytes(48).toString("hex");
      const context = buildContext({ sessionToken: fakeToken });

      const result = await pageAuthorization.requireAdminOrBarberPage(context);

      expect(result).toEqual({ notFound: true });
    });
  });

  describe("Admin user", () => {
    test("Returns user object for a valid admin session", async () => {
      const admin = await orchestrator.createUser({ accessLevel: "admin" });
      const sessionObject = await orchestrator.createSession(admin.userId);
      const context = buildContext({ sessionToken: sessionObject.token });

      const result = await pageAuthorization.requireAdminOrBarberPage(context);

      expect(result.notFound).toBeUndefined();
      expect(result.user).toMatchObject({
        userId: admin.userId,
        accessLevel: "admin",
      });
      expect(result.user.passwordHash).toBeUndefined();
    });
  });

  describe("Barber user", () => {
    test("Returns user object for a valid barber session", async () => {
      const barber = await orchestrator.createUser({ accessLevel: "barber" });
      const sessionObject = await orchestrator.createSession(barber.userId);
      const context = buildContext({ sessionToken: sessionObject.token });

      const result = await pageAuthorization.requireAdminOrBarberPage(context);

      expect(result.notFound).toBeUndefined();
      expect(result.user).toMatchObject({
        userId: barber.userId,
        accessLevel: "barber",
      });
      expect(result.user.passwordHash).toBeUndefined();
    });

    test("Renews the session and sets Set-Cookie on the SSR response", async () => {
      const barber = await orchestrator.createUser({ accessLevel: "barber" });
      const sessionObject = await orchestrator.createSession(barber.userId);
      const context = buildContext({ sessionToken: sessionObject.token });

      await pageAuthorization.requireAdminOrBarberPage(context);

      const setCookieHeader = context.res.getHeader("set-cookie");
      expect(typeof setCookieHeader).toBe("string");
      expect(setCookieHeader).toContain("session_id=");
      expect(setCookieHeader).toContain("HttpOnly");
    });
  });
});
