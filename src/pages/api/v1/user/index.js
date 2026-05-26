import { createRouter } from "next-connect";

import authentication from "@/infra/authentication";
import controller from "@/infra/controller";
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

  const { user: userFound, session: validSessionObject } =
    await authentication.getAuthenticatedUserFromRequest(request);

  const { sessionCookie } = await session.renew(
    validSessionObject.sessionId,
    request.cookies.session_id,
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
