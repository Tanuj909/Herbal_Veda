import { defineConfig, env } from "prisma/config";

// Load environment variables natively
try {
  process.loadEnvFile();
} catch (e) {
  // Ignore error if file is missing
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "node prisma/seed.js",
  },
});
