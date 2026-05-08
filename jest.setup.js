/* eslint-disable no-undef */
require("dotenv").config({ path: ".env" });
const { prisma } = require("./src/infra/prisma");

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
