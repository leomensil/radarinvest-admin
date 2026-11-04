import { baseUrl, loadStoredToken } from "./client";

/** Untyped admin helpers until contracts vendor sync (0.8.32). */
export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = loadStoredToken();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text.slice(0, 200)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
