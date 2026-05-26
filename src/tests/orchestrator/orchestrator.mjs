import { execFileSync } from "node:child_process";

import * as cookie from "cookie";
import retry from "async-retry";
import { faker } from "@faker-js/faker";

import webserver from "../../infra/webserver.mjs";
import { prisma as db } from "../../infra/prisma.js";
import password from "../../infra/password.js";
import session from "../../infra/session.js";

// const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  // await waitForEmailServer();

  async function waitForWebServer() {
    const messageWaiting = "Waiting for services.";
    const messageReady = "Services ready!";

    const startedAt = Date.now();

    function showElapsedTime() {
      return `${((Date.now() - startedAt) / 1000).toFixed(2)}s`;
    }

    function showSpinner() {
      const intervalToUpdateMs = 50;
      const spinner = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
      const index =
        Math.floor(Date.now() / intervalToUpdateMs) % spinner.length;

      return `${showElapsedTime()} ${spinner[index]}`;
    }

    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      process.stdout.write(`\r🟡 ${messageWaiting} ${showSpinner()}`);

      const response = await fetch(`${webserver.origin}/api/v1/status`);

      if (response.status !== 200) {
        throw new Error("Web server is not ready yet.");
      }

      process.stdout.write(`\r⚫ ${messageWaiting} - ${showElapsedTime()}`);
      process.stdout.write(`\n🟢 ${messageReady}\n`);
    }
  }
}

/**
 * Fully resets the test database using Prisma Migrate.
 *
 * !!! WARNING !!!
 * This is destructive. It removes all data from the target database/schema
 * and reapplies the Prisma migrations.
 *
 * This function must only run against the test database!
 */
async function clearDatabase() {
  assertSafeEnvironment();

  execFileSync("npx", ["prisma", "migrate", "reset", "--force"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION:
        "I understand this command resets the test database and destroys all test data.",
    },
  });
}

function assertSafeEnvironment() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      `Refusing to reset database in NODE_ENV="${process.env.NODE_ENV}". ` +
        `clearDatabase() can only run when NODE_ENV="test".`,
    );
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined.");
  }

  const databaseUrl = process.env.DATABASE_URL.toLowerCase();

  const isProbablyTestDatabase =
    databaseUrl.includes("test") ||
    databaseUrl.includes("_test") ||
    databaseUrl.includes("-test");

  if (!isProbablyTestDatabase) {
    throw new Error(
      "Refusing to reset database because DATABASE_URL does not look like a test database. " +
        "Use a dedicated test database whose name clearly includes 'test'.",
    );
  }
}

async function createUser(userObject = {}) {
  const username =
    userObject.username || faker.internet.username().replace(/[_.-]/g, "");

  const email = (userObject.email || faker.internet.email()).toLowerCase();

  const passwordHash = await password.hash(
    userObject.password || "supersecurepassword123",
  );

  return await db.user.create({
    data: {
      username,
      email,
      passwordHash,
      accessLevel: userObject.accessLevel || "barber",
      linkedBarberId: userObject.linkedBarberId || null,
      isActive: userObject.isActive ?? true,
    },
  });
}

async function createSession(userId) {
  const sessionObject = await session.create(userId);

  const parsedCookie = cookie.parse(sessionObject.sessionCookie);

  const rawSessionToken = parsedCookie.session_id || parsedCookie.session_token;

  if (!rawSessionToken) {
    throw new Error("Could not extract raw session token from session cookie.");
  }

  return {
    ...sessionObject,
    token: rawSessionToken,
  };
}

async function createBarber(barberObject = {}) {
  return await db.barber.create({
    data: {
      barberName: barberObject.barberName || faker.person.fullName(),
      phoneNumber: barberObject.phoneNumber || null,
      workStart: barberObject.workStart || "08:00",
      workEnd: barberObject.workEnd || "18:00",
      lunchStart: barberObject.lunchStart || null,
      lunchEnd: barberObject.lunchEnd || null,
      isActive: barberObject.isActive ?? true,
    },
  });
}

async function createService(serviceObject = {}) {
  return await db.service.create({
    data: {
      serviceName: serviceObject.serviceName || faker.commerce.productName(),
      serviceDescription: serviceObject.serviceDescription || null,
      duration: serviceObject.duration || 30,
      price: serviceObject.price || 50,
      isActive: serviceObject.isActive ?? true,
    },
  });
}

async function createClient(clientObject = {}) {
  return await db.client.create({
    data: {
      clientName: clientObject.clientName || faker.person.fullName(),
      clientPhone: clientObject.clientPhone || null,
      isActive: clientObject.isActive ?? true,
    },
  });
}

async function createAppointment(appointmentObject = {}) {
  return await db.appointment.create({
    data: {
      appointmentDatetime: appointmentObject.appointmentDatetime || new Date(),
      appointmentEndDatetime:
        appointmentObject.appointmentEndDatetime || new Date(),
      totalDuration: appointmentObject.totalDuration || 0,
      status: appointmentObject.status || "AGENDADO",
      clientId: appointmentObject.clientId,
      barberId: appointmentObject.barberId,
    },
  });
}

async function linkUserToBarber(userId, barberId) {
  return await db.user.update({
    where: { userId },
    data: { linkedBarberId: barberId },
  });
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  createUser,
  createSession,
  createBarber,
  createService,
  createClient,
  createAppointment,
  linkUserToBarber,
};

export default orchestrator;
