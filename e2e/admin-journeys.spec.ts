import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const apiBase = process.env.API_BASE_URL ?? "http://127.0.0.1:3001";
const adminBase = process.env.ADMIN_BASE_URL ?? "http://127.0.0.1:3004";

async function registerUser(request: APIRequestContext, label: string) {
  const email = `pw_adm_${label}_${Date.now()}@example.com`;
  const password = "test-password-123";
  await request.post(`${apiBase}/auth/register`, {
    data: { email, password, name: label },
  });
  const login = await request.post(`${apiBase}/auth/login`, {
    data: { email, password },
  });
  const body = await login.json();
  return { email, password, token: body.accessToken as string };
}

async function injectAdminSession(page: Page, token: string) {
  await page.goto(`${adminBase}/login`);
  await page.evaluate((t) => {
    sessionStorage.setItem("ri_admin_token", t);
  }, token);
  await page.goto(`${adminBase}/admin`);
}

test.describe("Admin focused journeys", () => {
  test("3. USER cannot use admin API or stay in /admin", async ({ page, request }) => {
    const u = await registerUser(request, "user");
    const denied = await request.get(`${apiBase}/admin/data-sources`, {
      headers: { Authorization: `Bearer ${u.token}` },
    });
    expect(denied.status()).toBe(403);

    await injectAdminSession(page, u.token);
    await expect(page).toHaveURL(/login/, { timeout: 15_000 });
  });

  test("1. SA: toggle matrix via API, audit persists; UI shows capabilities", async ({
    page,
    request,
  }) => {
    test.skip(!process.env.ADMIN_SA_EMAIL, "ADMIN_SA_EMAIL required (host seed)");
    const email = process.env.ADMIN_SA_EMAIL!;
    const password = process.env.ADMIN_SA_PASSWORD ?? "test-password-123";
    const login = await request.post(`${apiBase}/auth/login`, {
      data: { email, password },
    });
    expect(login.ok()).toBeTruthy();
    const { accessToken } = await login.json();
    const auth = { Authorization: `Bearer ${accessToken}` };

    const me = await request.get(`${apiBase}/me`, { headers: auth });
    expect((await me.json()).role).toBe("SUPER_ADMIN");

    const matrix = await request.get(`${apiBase}/admin/feature-matrix`, { headers: auth });
    expect(matrix.ok()).toBeTruthy();
    const rows = (await matrix.json()) as {
      featureKey: string;
      isActive: boolean;
      primarySourceId?: string | null;
      fallbackSourceId?: string | null;
    }[];
    const payload = rows.map((r) => ({
      featureKey: r.featureKey,
      isActive: r.featureKey === "SERIES_IPCA" ? !r.isActive : r.isActive,
      primarySourceId: r.primarySourceId ?? null,
      fallbackSourceId: r.fallbackSourceId ?? null,
    }));
    const put = await request.put(`${apiBase}/admin/feature-matrix`, {
      headers: auth,
      data: payload,
    });
    expect(put.ok()).toBeTruthy();

    const audit = await request.get(`${apiBase}/admin/audit?limit=10`, { headers: auth });
    const entries = await audit.json();
    expect(
      entries.some((e: { reason?: string }) => String(e.reason ?? "").includes("feature_matrix")),
    ).toBe(true);

    await injectAdminSession(page, accessToken);
    await expect(page.getByTestId("admin-ops-overview")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("link", { name: "Fontes / capacidades" }).click();
    await expect(page.getByTestId("admin-capabilities")).toBeVisible();
  });

  test("2. SA: jobs page shows real runs table", async ({ page, request }) => {
    test.skip(!process.env.ADMIN_SA_EMAIL, "ADMIN_SA_EMAIL required");
    const email = process.env.ADMIN_SA_EMAIL!;
    const password = process.env.ADMIN_SA_PASSWORD ?? "test-password-123";
    const login = await request.post(`${apiBase}/auth/login`, {
      data: { email, password },
    });
    const { accessToken } = await login.json();
    await injectAdminSession(page, accessToken);
    await page.getByRole("link", { name: "Jobs" }).click();
    await expect(page.getByTestId("admin-jobs")).toBeVisible({ timeout: 15_000 });
  });

  test("4. SA: AI prep page never shows credential plaintext", async ({ page, request }) => {
    test.skip(!process.env.ADMIN_SA_EMAIL, "ADMIN_SA_EMAIL required");
    const email = process.env.ADMIN_SA_EMAIL!;
    const password = process.env.ADMIN_SA_PASSWORD ?? "test-password-123";
    const login = await request.post(`${apiBase}/auth/login`, {
      data: { email, password },
    });
    const { accessToken } = await login.json();

    await request.post(`${apiBase}/admin/data-sources`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        slug: `llm_${Date.now()}`,
        name: "LLM fixture",
        category: "LLM",
        driver: "OPENAI",
        credential: "sk-test-secret-should-not-leak",
        modelName: "gpt-test",
        active: true,
      },
    });

    const list = await request.get(`${apiBase}/admin/data-sources`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = JSON.stringify(await list.json());
    expect(body).not.toContain("sk-test-secret-should-not-leak");
    expect(body).not.toMatch(/encryptedCredentials/i);

    await injectAdminSession(page, accessToken);
    await page.getByRole("link", { name: "IA (prep)" }).click();
    await expect(page.getByTestId("admin-ai")).toBeVisible({ timeout: 15_000 });
    const aiText = await page.getByTestId("admin-ai").innerText();
    expect(aiText).not.toContain("sk-test-secret-should-not-leak");
  });
});
