import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";

/**
 * Inc.5 Admin — SUPER_ADMIN via SQL no PG descartável (`DATABASE_URL` + `psql`).
 * Sem endpoint público de promoção; sem credencial administrativa fixa no produto.
 */
const apiBase = process.env.API_BASE_URL ?? "http://127.0.0.1:3001";
const adminBase = process.env.ADMIN_BASE_URL ?? "http://127.0.0.1:3004";

async function registerViaApi(request: APIRequestContext, label: string) {
  const email = `pw_inc56_${label}_${Date.now()}@example.com`;
  const password = "test-password-123";
  const reg = await request.post(`${apiBase}/auth/register`, {
    data: { email, password, name: label },
  });
  expect(reg.ok()).toBeTruthy();
  const login = await request.post(`${apiBase}/auth/login`, {
    data: { email, password },
  });
  expect(login.ok()).toBeTruthy();
  const body = await login.json();
  return { email, password, token: body.accessToken as string };
}

function promoteSuperAdminSql(email: string) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required");
  execFileSync(
    "psql",
    [url, "-v", "ON_ERROR_STOP=1", "-c", `update users set role = 'SUPER_ADMIN' where email = '${email.replace(/'/g, "''")}';`],
    { stdio: "pipe" },
  );
}

async function injectAdminSession(page: Page, token: string) {
  await page.goto(`${adminBase}/login`);
  await page.evaluate((t) => {
    sessionStorage.setItem("ri_admin_token", t);
  }, token);
}

test.describe("Inc.5 Admin orchestration (throwaway SA)", () => {
  test("USER denied; SA sees deps/states; trigger+audit; UI consulta grafo", async ({
    page,
    request,
  }) => {
    test.skip(!process.env.DATABASE_URL, "DATABASE_URL required for SQL promote");

    const user = await registerViaApi(request, "user");
    const denied = await request.get(
      `${apiBase}/admin/series-ingest/orchestration`,
      { headers: { Authorization: `Bearer ${user.token}` } },
    );
    expect(denied.status()).toBe(403);

    await injectAdminSession(page, user.token);
    await page.goto(`${adminBase}/admin/jobs`);
    await expect(page).toHaveURL(/login/, { timeout: 15_000 });

    const sa = await registerViaApi(request, "sa");
    promoteSuperAdminSql(sa.email);
    const relog = await request.post(`${apiBase}/auth/login`, {
      data: { email: sa.email, password: sa.password },
    });
    const { accessToken } = await relog.json();
    const auth = { Authorization: `Bearer ${accessToken}` };

    const orch = await request.get(
      `${apiBase}/admin/series-ingest/orchestration`,
      { headers: auth },
    );
    expect(orch.ok()).toBeTruthy();
    const graph = await orch.json();
    expect(graph.productionCronEnabled).toBe(false);
    expect(graph.slotRoles.length).toBeGreaterThanOrEqual(3);
    expect(graph.capabilities.length).toBeGreaterThanOrEqual(7);

    const runsBefore = await request.get(`${apiBase}/admin/series-ingest/runs?capability=CDI`, {
      headers: auth,
    });
    expect(runsBefore.ok()).toBeTruthy();

    const trigger = await request.post(`${apiBase}/admin/series-ingest/runs`, {
      headers: auth,
      data: { capability: "CDI" },
    });
    // 202 accepted or 409 if feature matrix disabled in seed
    expect([202, 409]).toContain(trigger.status());
    if (trigger.status() === 202) {
      const run = await trigger.json();
      expect(run.capability).toBe("CDI");
      expect(["SUCCEEDED", "FAILED", "SKIPPED", "RUNNING"]).toContain(run.status);
      if (run.metrics?.orchestration) {
        expect(run.metrics.orchestration.mutatesFinancialFacts).toBe(false);
      }
    }

    const audit = await request.get(`${apiBase}/admin/audit?limit=20`, {
      headers: auth,
    });
    expect(audit.ok()).toBeTruthy();

    await injectAdminSession(page, accessToken);
    await page.goto(`${adminBase}/admin/jobs`);
    await expect(page.getByTestId("admin-jobs")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("admin-orchestration")).toBeVisible();
    await expect(
      page.getByText(/TREASURY_PU_MORNING|SESSION_CLOSE|INTRADAY_OBSERVE/),
    ).toBeVisible();
    await expect(page.getByText(/Cron produção/i)).toBeVisible();
  });
});
