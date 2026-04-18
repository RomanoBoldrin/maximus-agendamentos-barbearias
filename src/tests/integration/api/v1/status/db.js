import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const clientCount = await prisma.client.count();

    return res.status(200).json({
      database: "ok",
      clientCount,
    });
  } catch (error) {
    return res.status(500).json({
      database: "fail",
      error: "Database connection failed",
    });
  }
}
