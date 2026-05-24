import crypto from "node:crypto";

import * as cookie from "cookie";

import { prisma as db } from "./prisma.js";

const SESSION_DURATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days
const SESSION_DURATION_IN_SECONDS = SESSION_DURATION_IN_MILLISECONDS / 1000;
const SESSION_COOKIE_NAME = "session_id";

async function create(userId) {
  const rawSessionToken = generateSessionToken();
  const sessionTokenHash = hashSessionToken(rawSessionToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_IN_MILLISECONDS);

  const createdSession = await db.session.create({
    data: {
      tokenHash: sessionTokenHash,
      userId,
      expiresAt,
    },
    select: {
      sessionId: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const sessionCookie = createSessionCookie(rawSessionToken);

  return {
    session: createdSession,
    sessionCookie,
  };
}

async function findValidSessionbyToken(rawSessionToken) {
  const sessionTokenHash = hashSessionToken(rawSessionToken);

  return await db.session.findFirst({
    where: {
      tokenHash: sessionTokenHash,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      sessionId: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function renew(sessionId, rawSessionToken) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_IN_MILLISECONDS);

  const renewedSession = await db.session.update({
    where: {
      sessionId,
    },
    data: {
      expiresAt,
    },
    select: {
      sessionId: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const sessionCookie = createSessionCookie(rawSessionToken);

  return {
    session: renewedSession,
    sessionCookie,
  };
}

async function expireById(sessionId) {
  return await db.session.update({
    where: {
      sessionId,
    },
    data: {
      expiresAt: new Date(),
    },
    select: {
      sessionId: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

function generateSessionToken() {
  return crypto.randomBytes(48).toString("hex");
}

function hashSessionToken(sessionToken) {
  return crypto.createHash("sha256").update(sessionToken).digest("hex");
}

function createSessionCookie(sessionToken) {
  return cookie.serialize(SESSION_COOKIE_NAME, sessionToken, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_DURATION_IN_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

const session = {
  create,
  findValidSessionbyToken,
  renew,
  expireById,
  hashSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_IN_MILLISECONDS,
  SESSION_DURATION_IN_SECONDS,
};

export default session;
