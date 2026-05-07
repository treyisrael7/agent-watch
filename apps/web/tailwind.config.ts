import sharedConfig from "@agent-watch/config/tailwind";
import type { Config } from "tailwindcss";

const config = {
  ...sharedConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;

export default config;
