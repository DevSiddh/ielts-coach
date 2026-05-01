import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = fileURLToPath(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  webpack(config, { dev, isServer }) {
    if (dev) {
      config.cache = {
        type: "filesystem",
        cacheDirectory: path.join(os.tmpdir(), "ielts-coach-next-webpack-cache", isServer ? "server" : "client"),
        buildDependencies: {
          config: [configPath]
        }
      };
    }

    return config;
  }
};

export default nextConfig;
