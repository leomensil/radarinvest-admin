import createClient from "openapi-fetch";
import type { paths } from "@leomensil/radarinvest-contracts";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:3001";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) sessionStorage.setItem("ri_admin_token", token);
    else sessionStorage.removeItem("ri_admin_token");
  }
}

export function loadStoredToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("ri_admin_token");
}

export const api = createClient<paths>({ baseUrl, credentials: "include" });

api.use({
  onRequest({ request }) {
    const token = accessToken ?? loadStoredToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
});

export { baseUrl };
