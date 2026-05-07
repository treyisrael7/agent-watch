import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@agent-watch/ui", "@agent-watch/types"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
