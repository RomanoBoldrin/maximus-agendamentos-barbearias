import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { ValidationError } from "@/infra/errors";
import password from "@/infra/password";
import { prisma } from "@/infra/prisma.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { username, email, password: rawPassword, accessLevel } = request.body;

  if (!username || !email || !rawPassword || !accessLevel) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "Missing required fields.",
      action: "Send username, email, password and accessLevel.",
      status_code: 400,
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  if (!["admin", "barber"].includes(accessLevel)) {
    const publicErrorObject = new ValidationError();

    return response.status(publicErrorObject.statusCode).json({
      name: "ValidationError",
      message: "Invalid access level.",
      action: "Use a valid access level: admin or barber.",
      status_code: 400,
    });
  }

  const passwordHash = await password.hash(rawPassword);

  try {
    const createdUser = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        accessLevel,
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

    return response.status(201).json({
      userId: createdUser.userId,
      username: createdUser.username,
      email: createdUser.email,
      accessLevel: createdUser.accessLevel,
      linkedBarberId: createdUser.linkedBarberId,
      isActive: createdUser.isActive,
      createdAt: createdUser.createdAt.toISOString(),
      updatedAt: createdUser.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error.code === "P2002") {
      const duplicatedField = error.meta?.target?.[0];

      return response.status(400).json({
        name: "ValidationError",
        message: `The ${duplicatedField || "field"} informed is already being used.`,
        action: "Use another value to perform this operation.",
        status_code: 400,
      });
    }

    throw error;
  }
}
