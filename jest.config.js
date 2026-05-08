const nextJest = require("next/jest");

const createJestConfig = nextJest();

const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  moduleNameMapper: {
    // Maps imports starting with "@/..." to the project's src directory
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
