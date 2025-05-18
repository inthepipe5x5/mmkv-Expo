// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // "react-native/no-inline-styles": "off",
      // "react-native/no-color-literals": "off",
      // "react-native/no-single-element-style-arrays": "off",
      // "react-native/no-raw-text": "off",
      // "react/jsx-uses-react": "off",
      // "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import/no-unresolved": "on",
      "import/no-named-as-default": "off",
    },
  }
]);
