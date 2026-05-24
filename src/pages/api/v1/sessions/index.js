import { createRouter } from "next-connect";

import authentication from "@/infra/authentication.js";
import controller from "@/infra/controller";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/infra/errors";
import session from "@/infra/session.js";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { email, password } = request.body;

  if (!email || !password) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "Missing required fields.",
      action: "Send email and password.",
      status_code: 400,
    });
  }

  const authenticatedUser = await authentication.getAuthenticatedUser({
    email,
    password,
  });

  if (!authenticatedUser.isActive) {
    const publicErrorObject = new ForbiddenError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ForbiddenError",
      message: "User is not active.",
      action: "Contact an administrator to reactivate this user.",
      status_code: 403,
    });
  }

  const { session: createdSession, sessionCookie } = await session.create(
    authenticatedUser.userId,
  );

  response.setHeader("Set-Cookie", sessionCookie);

  return response.status(201).json({
    session_id: createdSession.sessionId,
    expires_at: createdSession.expiresAt.toISOString(),
    created_at: createdSession.createdAt.toISOString(),
    updated_at: createdSession.updatedAt.toISOString(),
    user: {
      user_id: authenticatedUser.userId,
      username: authenticatedUser.username,
      email: authenticatedUser.email,
      access_level: authenticatedUser.accessLevel,
      linked_barber_id: authenticatedUser.linkedBarberId,
      is_active: authenticatedUser.isActive,
      created_at: authenticatedUser.createdAt.toISOString(),
      updated_at: authenticatedUser.updatedAt.toISOString(),
    },
  });
}

async function deleteHandler(request, response) {
  const rawSessionToken = request.cookies.session_id;

  if (!rawSessionToken) {
    throw new UnauthorizedError({
      message: "Invalid or expired session.",
      action: "Login to continue.",
    });
  }

  const validSessionObject =
    await session.findValidSessionbyToken(rawSessionToken);

  if (!validSessionObject) {
    throw new UnauthorizedError({
      message: "Invalid or expired session.",
      action: "Login to continue.",
    });
  }

  const expiredSession = await session.expireById(validSessionObject.sessionId);

  controller.clearSessionCookie(response);

  return response.status(200).json({
    session_id: expiredSession.sessionId,
    user_id: expiredSession.userId,
    expires_at: expiredSession.expiresAt.toISOString(),
    created_at: expiredSession.createdAt.toISOString(),
    updated_at: expiredSession.updatedAt.toISOString(),
  });
}
