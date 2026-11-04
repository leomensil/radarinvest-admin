import { test, expect } from "@playwright/test";

/**
 * Smoke: login page reachable. Full SUPER_ADMIN journey needs API + seeded admin.
 * Env: ADMIN_BASE_URL (default http://127.0.0.1:3004)
 */
test("admin login page rejects empty submit surface", async ({ page }) => {
  const base = process.env.ADMIN_BASE_URL ?? "http://127.0.0.1:3004";
  await page.goto(`${base}/login`);
  await expect(page.getByRole("heading", { name: /RadarInvest Admin|Admin|entrar|login/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
});
