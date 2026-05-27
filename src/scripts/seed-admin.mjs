import { prisma as db } from "../infra/prisma.js";
import password from "../infra/password.js";

async function main() {
  console.log("Starting admin provisioning...");

  const existingAdmin = await db.user.findFirst({
    where: { accessLevel: "admin" },
  });

  if (existingAdmin) {
    console.log(
      `You're all set, admin user already exists (username: ${existingAdmin.username}). Exiting successfully.`,
    );
    return;
  }

  let username = process.env.SEED_ADMIN_USERNAME;
  let email = process.env.SEED_ADMIN_EMAIL;
  let rawPassword = process.env.SEED_ADMIN_PASSWORD;

  if (process.env.NODE_ENV === "production") {
    if (!username || !email || !rawPassword) {
      throw new Error(
        "Missing required SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, or SEED_ADMIN_PASSWORD for production provisioning.",
      );
    }
  } else {
    username = username || "admin";
    email = email || "admin@maximusbarbers.com";
    rawPassword = rawPassword || "admin123";
  }

  console.log(`Provisioning admin user: ${username} (${email})...`);

  const passwordHash = await password.hash(rawPassword);

  const newAdmin = await db.user.create({
    data: {
      username: username,
      email: email,
      passwordHash: passwordHash,
      accessLevel: "admin",
      isActive: true,
    },
  });

  console.log(`Successfully created admin user with ID: ${newAdmin.userId}`);
}

main()
  .catch((e) => {
    console.error("Error during admin provisioning:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
