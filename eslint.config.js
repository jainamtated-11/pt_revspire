import globals from "globals";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**"
    ],
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        require: true,
        document: true,
        window: true,
        performance: true,
        requestAnimationFrame: true,
        cancelAnimationFrame: true,
        queueMicrotask: true,
        IntersectionObserver: true,
        PointerEvent: true
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 2021,
        sourceType: "module"
      }
    },
    plugins: {
      react: pluginReact,
      "react-hooks": reactHooks
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "react/prop-types": "off",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
