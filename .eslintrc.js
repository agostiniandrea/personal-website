/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "prettier",
    "eslint-plugin-import-helpers",
    "import",
  ],
  extends: [
    "next",
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:storybook/recommended",
  ],
  rules: {
    // @TODO the following rules should be re-enabled as errors and fixed
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react/no-unescaped-entities": "warn",
    "react/no-children-prop": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "no-empty-pattern": "warn",
    "react/display-name": "warn",
    "react/no-array-index-key": "warn",
    // Right error rules
    "import/no-unresolved": "error",
    "@typescript-eslint/ban-types": ["warn"],
    "prettier/prettier": ["error"],
    "import-helpers/order-imports": [
      "error",
      {
        newlinesBetween: "always",
        groups: [
          "/^react/",
          "module",
          "/^@jibe-ecom/",
          ["parent", "sibling", "index"],
        ],
        alphabetize: {
          order: "asc",
          ignoreCase: true,
        },
      },
    ],
  },
};
