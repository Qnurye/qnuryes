// noinspection JSUnresolvedReference

import globals from "globals";
import pluginJs from "@eslint/js";
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y'
import ts from "typescript-eslint";

export default [
  pluginJs.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    ignores: ["dist/", "node_modules/", ".astro/", "src/env.d.ts"],
  },
  {
    files: ["**/*.{js,mjs,cjs,mts,ts,tsx,jsx,astro}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "semi": "off",
      "astro/semi": [
        "error",
        "always",
        {"omitLastInOneLineBlock": true}
      ]
    },
    languageOptions: { globals: globals.browser },
    settings: {
      tailwindcss: {
        whitelist: ["hide-scrollbars", "collapsible.*"],
      },
    },
  }
];
