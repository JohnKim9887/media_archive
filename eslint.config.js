import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  globalIgnores(['dist', 'docs']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "unused-imports": unusedImports,
    },

    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/typedef": ["warn", { arrayDestructuring: true }],

      "semi": "error",
      "@typescript-eslint/typedef": ["warn", {
        variableDeclaration: true,
        parameter: true,
        propertyDeclaration: true,
        memberVariableDeclaration: true,
        objectDestructuring: true,
        arrayDestructuring: true
      }],
    // "overrides": [
    //   {
    //     "files": ["**/*.tsx"],
    //     "rules": {
    //       "@typescript-eslint/typedef": ["warn", {

    //         "arrayDestructuring": true
    //       }]
    //     }
    //   }]
    }
    
  },
])
