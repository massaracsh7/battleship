module.exports = {
  "env": {
    "node": true,
    "es2021": true,
    "jest/globals": true
  },
  "extends": [
    "airbnb-typescript/base",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module",
    "tsconfigRootDir": "<rootDir>"
  },
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-var-requires": "off",
  }
};