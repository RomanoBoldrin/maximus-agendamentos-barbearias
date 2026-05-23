import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { NotFoundError, ValidationError } from "@/infra/errors";
import password from "@/infra/password.js";
import { prisma as db } from "@/infra/prisma.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

const userPublicFields = {
  userId: true,
  username: true,
  email: true,
  accessLevel: true,
  linkedBarberId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

async function getHandler(request, response) {
  const { username } = request.query;

  const userFound = await db.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: userPublicFields,
  });

  if (!userFound) {
    throw new NotFoundError({
      message: "Username not found.",
      action: "Verify if the typed username is correct.",
    });
  }

  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const { username } = request.query;
  const userInputValues = request.body;

  const userFound = await db.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: {
      userId: true,
    },
  });

  if (!userFound) {
    throw new NotFoundError({
      message: "Username not found.",
      action: "Verify if the typed username is correct.",
    });
  }

  const allowedUserUpdateValues = {};

  if (userInputValues.username !== undefined) {
    allowedUserUpdateValues.username = userInputValues.username;
  }

  if (userInputValues.email !== undefined) {
    allowedUserUpdateValues.email = userInputValues.email.toLowerCase();
  }

  if (userInputValues.password !== undefined) {
    allowedUserUpdateValues.passwordHash = await password.hash(
      userInputValues.password,
    );
  }

  try {
    const updatedUser = await db.user.update({
      where: {
        userId: userFound.userId,
      },
      data: allowedUserUpdateValues,
      select: userPublicFields,
    });

    return response.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === "P2002") {
      throw new ValidationError({
        message: "The field informed is already being used.",
        action: "Use another value to perform this operation.",
      });
    }

    throw error;
  }
}
