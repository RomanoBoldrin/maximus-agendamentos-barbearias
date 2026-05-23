import orchestrator from "src/tests/orchestrator/orchestrator.mjs";
import { prisma } from "src/infra/prisma.js";

export default async function globalSetup() {
  await orchestrator.clearDatabase();
  
  // Disconnect the Prisma client to close any lingering connections
  // that may have been created during the migrate reset process
  await prisma.$disconnect();
}
