import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,

  prettier,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    ".swc/**",

    "node_modules/**",

    "src/generated/**",
    "prisma/migrations/**",

    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
