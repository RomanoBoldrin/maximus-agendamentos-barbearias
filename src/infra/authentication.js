import { UnauthorizedError, NotFoundError } from "@/infra/errors";
import password from "@/infra/password.js";
import { prisma as db } from "@/infra/prisma.js";
import session from "@/infra/session.js";

// Used to reduce timing differences between:
// - email not found
// - email found, but password incorrect
//
// These hashes do not represent real user passwords.
// The non-production hash uses a low cost to keep tests/development fast.
const FAKE_PASSWORD_HASH_PRODUCTION =
  "$2b$14$7Ko/sXjK7Z65cOcrK7aUPO9qIWl9rSvswcFXmoACUzOHZIiLv1mJe";

const FAKE_PASSWORD_HASH_NON_PRODUCTION =
  "$2b$04$7Ko/sXjK7Z65cOcrK7aUPO9qIWl9rSvswcFXmoACUzOHZIiLv1mJe";

async function getAuthenticatedUser({
  email: providedEmail,
  password: providedPassword,
}) {
  const normalizedEmail = providedEmail.trim().toLowerCase();

  const storedUser = await db.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      userId: true,
      username: true,
      email: true,
      passwordHash: true,
      accessLevel: true,
      linkedBarberId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const passwordHashToCompare =
    storedUser?.passwordHash || getFakePasswordHash();

  const passwordMatches = await password.compare(
    providedPassword,
    passwordHashToCompare,
  );

  if (!storedUser || !passwordMatches) {
    throw new UnauthorizedError({
      message: "Invalid email or password.",
      action: "Check your credentials and try again.",
    });
  }

  return storedUser;
}

async function getAuthenticatedUserFromRequest(request) {
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

  if (!userFound.isActive) {
    throw new UnauthorizedError({
      message: "User account is not active.",
      action: "Contact support to reactivate this account.",
    });
  }

  return {
    user: userFound,
    session: validSessionObject,
  };
}

function getFakePasswordHash() {
  if (process.env.NODE_ENV === "production") {
    return FAKE_PASSWORD_HASH_PRODUCTION;
  }

  return FAKE_PASSWORD_HASH_NON_PRODUCTION;
}

const authentication = {
  getAuthenticatedUser,
  getAuthenticatedUserFromRequest,
};

export default authentication;
