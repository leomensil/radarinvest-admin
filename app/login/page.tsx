"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { adminLogin } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await adminLogin(String(fd.get("email")), String(fd.get("password")));
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-semibold">RadarInvest Admin</h1>
        <p className="mb-4 text-sm text-muted">SUPER_ADMIN only</p>
        {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
        <label className="mb-2 block text-sm">
          E-mail
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-border px-3 py-2"
          />
        </label>
        <label className="mb-4 block text-sm">
          Senha
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border border-border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-accent px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
