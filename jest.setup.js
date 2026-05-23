require("dotenv").config({ path: ".env.test" });
const { prisma } = require("./src/infra/prisma");

// Note: With a connection pool, explicit $connect() isn't necessary.
// The pool creates connections on-demand for queries.

afterAll(async () => {
  await prisma.$disconnect();
});
