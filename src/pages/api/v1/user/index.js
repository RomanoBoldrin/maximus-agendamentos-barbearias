import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { NotFoundError, UnauthorizedError } from "@/infra/errors";
import { prisma as db } from "@/infra/prisma.js";
import session from "@/infra/session.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");

  const rawSessionToken = request.cookies.session_id;

  if (!rawSessionToken) {
    throw new UnauthorizedError({
      message: "User not authenticated.",
      action: "Login to access this resource.",
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

  const userFound = await db.user.findUnique({
    where: {
      userId: validSessionObject.userId,
    },
    select: {
      userId: true,
      username: true,
      email: true,
      accessLevel: true,
      linkedBarberId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!userFound) {
    throw new NotFoundError({
      message: "User linked to this session was not found.",
      action: "Login again or contact support.",
    });
  }

  const { sessionCookie } = await session.renew(
    validSessionObject.sessionId,
    rawSessionToken,
  );

  response.setHeader("Set-Cookie", sessionCookie);

  return response.status(200).json({
    user_id: userFound.userId,
    username: userFound.username,
    email: userFound.email,
    access_level: userFound.accessLevel,
    linked_barber_id: userFound.linkedBarberId,
    is_active: userFound.isActive,
    created_at: userFound.createdAt.toISOString(),
    updated_at: userFound.updatedAt.toISOString(),
  });
}
