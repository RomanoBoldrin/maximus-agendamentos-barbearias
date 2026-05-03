import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import pluginJest from "eslint-plugin-jest";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "build/**",
      "coverage/**",
      ".swc/**",
      "src/generated/**",
      "prisma/migrations/**",
      ".env*",
      "dist/**",
      "package-lock.json",
      "jsconfig.json",
    ],
  },

  // Base JavaScript
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      prettier,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "prettier/prettier": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Jest Tests
  {
    files: ["**/*.{spec,test}.js"],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      ...pluginJest.configs.recommended.rules,
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/valid-expect": "error",
    },
  },

  // JSON Files
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    rules: json.configs.recommended.rules,
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    rules: json.configs.recommended.rules,
  },

  // Markdown
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    rules: markdown.configs.recommended.rules,
  },

  // CSS
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    rules: css.configs.recommended.rules,
  },
];
