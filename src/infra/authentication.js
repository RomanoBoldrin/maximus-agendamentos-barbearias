import { UnauthorizedError } from "@/infra/errors";
import password from "@/infra/password.js";
import { prisma as db } from "@/infra/prisma.js";

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

function getFakePasswordHash() {
  if (process.env.NODE_ENV === "production") {
    return FAKE_PASSWORD_HASH_PRODUCTION;
  }

  return FAKE_PASSWORD_HASH_NON_PRODUCTION;
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
