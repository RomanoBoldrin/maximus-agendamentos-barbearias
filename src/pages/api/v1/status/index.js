import "dotenv/config";
import { prisma } from "@/infra/prisma.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  // Postgres Version
  const databaseVersionResult = await prisma.$queryRaw`SHOW server_version;`;
  const databaseVersionValue = databaseVersionResult[0].server_version;

  // Max Connections
  const databaseMaxConnectionsResult =
    await prisma.$queryRaw`SHOW max_connections;`;
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult[0].max_connections;

  // Opened Connections
  const databaseName = process.env.POSTGRES_DB;

  const result = await prisma.$queryRaw`
  SELECT COUNT(*)::int AS count
  FROM pg_stat_activity
  WHERE datname = ${databaseName};`;

  const openedConnections = result[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: parseInt(openedConnections),
      },
    },
  });
}

export default status;
