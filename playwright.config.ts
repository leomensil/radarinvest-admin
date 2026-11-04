import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: process.env.ADMIN_BASE_URL ?? "http://127.0.0.1:3004",
    trace: "off",
  },
});
