import nextConfig from "@agent-watch/config/eslint/next";

export default [
  ...nextConfig,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
];
