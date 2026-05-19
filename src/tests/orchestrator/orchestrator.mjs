import { execFileSync } from "node:child_process";

import retry from "async-retry";

import webserver from "../../infra/webserver.mjs";

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

  // async function waitForEmailServer() {
  //   return retry(fetchEmailPage, {
  //     retries: 100,
  //     maxTimeout: 1000,
  //   });

  //   async function fetchEmailPage() {
  //     const response = await fetch(emailHttpUrl);

  //     if (response.status !== 200) {
  //       throw new Error("Email server is not ready yet.");
  //     }
  //   }
  // }
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

      /**
       * Prisma may block destructive commands when they are triggered by
       * AI-assisted workflows. This variable documents explicit consent for
       * this destructive test-only reset.
       */
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

const orchestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orchestrator;
