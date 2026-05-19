require("dotenv").config({ path: ".env.test" });
const { prisma } = require("./src/infra/prisma");

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
