import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import jestPlugin from "eslint-plugin-jest";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybookPlugin from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**/*",
      "storybook-static/**/*",
      "node_modules/**/*",
      "dist/**/*",
      "build/**/*",
      ".yarn/**/*",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        ...globals.jest,
        React: "readonly",
        JSX: "readonly",
        ImageProps: "readonly",
        CtaProps: "readonly",
        __STORYBOOK_COMPONENTS__: "readonly",
        __STORYBOOK_CORE_EVENTS__: "readonly",
        __STORYBOOK_THEMING__: "readonly",
        __STORYBOOK_API__: "readonly",
        __STORYBOOK_CLIENT_LOGGER__: "readonly",
        __STORYBOOK_CORE_EVENTS_MANAGER_ERRORS__: "readonly",
        __STORYBOOK_TYPES__: "readonly",
        __STORYBOOK_ROUTER__: "readonly",
        __STORYBOOK_ICONS__: "readonly",
        __REACT_DOM__: "readonly",
        __REACT_DOM_CLIENT__: "readonly",
        define: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      jest: jestPlugin,
      storybook: storybookPlugin,
      "@next/next": nextPlugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^react$", "^react-dom"],
            ["^next"],
            ["^@?\\w"],
            [
              "^@components/",
              "^@config/",
              "^@constants",
              "^@lib/",
              "^@utils/",
              "^@test-utils/",
            ],
            ["^\\.\\.", "^\\./"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "jsx-a11y/anchor-is-valid": "off",
      "no-undef": "error",
      "no-empty": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "error",
      "@next/next/no-unwanted-polyfillio": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
