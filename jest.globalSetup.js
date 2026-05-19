import orchestrator from "src/tests/orchestrator/orchestrator.mjs";

export default async function globalSetup() {
  await orchestrator.clearDatabase();
}
