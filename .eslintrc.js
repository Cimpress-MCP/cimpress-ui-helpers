module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 7,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    }
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    indent: ["error", 4],
    "require-jsdoc": ["off"],
    "no-console": ["off"],
    "max-len": ["off", 160]
  }
};
