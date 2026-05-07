import baseConfig from "@agent-watch/config/eslint/base";

export default [
  ...baseConfig,
  {
    ignores: ["**/.next/**", "**/dist/**", "**/node_modules/**"],
  },
];
