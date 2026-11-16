import paraglide from "@inlang/paraglide-js/eslint";
import tsParser from "@typescript-eslint/parser";

export default [
 { ignores: ["src/paraglide/**", "node_modules/**"] },
 {
  files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
  languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { paraglide },
  rules: { "paraglide/no-dynamic-message-access": ["error",{"messageModuleDirectories":["paraglide"]}] },
 },
];
