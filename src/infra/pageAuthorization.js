import authentication from "@/infra/authentication";
import { NotFoundError, UnauthorizedError } from "@/infra/errors";
import session from "@/infra/session.js";

/**
 * Resolves the authenticated user from a Next.js `getServerSideProps` context,
 * renews the session, and sets the refreshed cookie on the SSR response.
 *
 * Returns `{ notFound: true }` for any authentication failure so that
 * callers can propagate it directly to Next.js — making the page behave
 * as if it does not exist rather than revealing a login or forbidden page.
 *
 * Re-throws unexpected errors so they surface as 500s instead of being
 * silently swallowed.
 *
 * @param {import("next").GetServerSidePropsContext} context
 * @returns {Promise<{ user: object } | { notFound: true }>}
 */
async function getValidatedUser(context) {
  try {
    const { user, session: validSession } =
      await authentication.getAuthenticatedUserFromRequest(context.req);

    // Renew the session so an active user is not logged out mid-session.
    const rawSessionToken = context.req.cookies[session.SESSION_COOKIE_NAME];
    const { sessionCookie } = await session.renew(
      validSession.sessionId,
      rawSessionToken,
    );

    context.res.setHeader("Set-Cookie", sessionCookie);

    return { user };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      return { notFound: true };
    }

    // Unknown errors (e.g. DB connectivity issues) bubble up as 500s.
    throw error;
  }
}

/**
 * Guards a dashboard page so that only `admin` users can access it.
 *
 * Usage inside `getServerSideProps`:
 *
 *   const result = await pageAuthorization.requireAdminPage(context);
 *   if (result.notFound) return { notFound: true };
 *   return { props: {} };
 *
 * @param {import("next").GetServerSidePropsContext} context
 * @returns {Promise<{ user: object } | { notFound: true }>}
 */
async function requireAdminPage(context) {
  const result = await getValidatedUser(context);

  if (result.notFound) {
    return { notFound: true };
  }

  if (result.user.accessLevel !== "admin") {
    return { notFound: true };
  }

  return { user: result.user };
}

/**
 * Guards a dashboard page so that both `admin` and `barber` users can access it.
 *
 * Usage inside `getServerSideProps`:
 *
 *   const result = await pageAuthorization.requireAdminOrBarberPage(context);
 *   if (result.notFound) return { notFound: true };
 *   return { props: {} };
 *
 * @param {import("next").GetServerSidePropsContext} context
 * @returns {Promise<{ user: object } | { notFound: true }>}
 */
async function requireAdminOrBarberPage(context) {
  const result = await getValidatedUser(context);

  if (result.notFound) {
    return { notFound: true };
  }

  // Both admin and barber are allowed; data scoping is enforced at the API layer.
  return { user: result.user };
}

const pageAuthorization = {
  requireAdminPage,
  requireAdminOrBarberPage,
};

export default pageAuthorization;
