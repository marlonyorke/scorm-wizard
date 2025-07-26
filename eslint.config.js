import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage", ".github", "*.config.js", "vite.config.ts"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "react": reactPlugin,
      "import": importPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      // React rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/prop-types": "off", // We use TypeScript for prop validation
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/jsx-uses-react": "off", // Not needed in React 17+
      "react/jsx-uses-vars": "error", // Prevent variables used in JSX from being marked as unused
      "react/no-unescaped-entities": "warn",
      "react/self-closing-comp": "warn", // Enforce self-closing tags

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",

      // Import rules
      "import/no-unresolved": "off", // TypeScript handles this
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],
      "import/first": "warn",
      "import/no-duplicates": "warn",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "warn",
      "no-alert": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "eqeqeq": ["warn", "always"],
      "curly": ["warn", "all"],
      "brace-style": ["warn", "1tbs"],
      "indent": ["warn", 2, { "SwitchCase": 1 }],
      "quotes": ["warn", "double", { "avoidEscape": true }],
      "semi": ["warn", "always"],
      "comma-dangle": ["warn", "always-multiline"],
      "arrow-parens": ["warn", "always"],
    },
  },
  // JavaScript files configuration
  {
    files: ["**/*.js", "**/*.jsx"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Add JavaScript-specific rules here
      "no-var": "error",
      "prefer-const": "warn",
    },
  }
);
