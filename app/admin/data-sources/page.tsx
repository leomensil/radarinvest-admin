"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";

type Source = {
  id: string;
  slug: string;
  name: string;
  category: "MARKET" | "LLM" | "GOVERNMENT";
  driver: string;
  active: boolean;
  isConfigured: boolean;
  credentialHint?: string | null;
  baseUrl?: string | null;
  modelName?: string | null;
  timeoutMs?: number | null;
  rateLimitRpm?: number | null;
};

const EMPTY: Omit<Source, "id" | "isConfigured"> & { credential: string } = {
  slug: "",
  name: "",
  category: "MARKET",
  driver: "BRAPI",
  active: true,
  credential: "",
  baseUrl: "",
  modelName: "",
  timeoutMs: 15000,
  rateLimitRpm: 60,
};

export default function DataSourcesPage() {
  const [rows, setRows] = useState<Source[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: string }) | null>(null);

  const load = useCallback(async () => {
    const { data } = await api.GET("/admin/data-sources");
    if (data) setRows(data as Source[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function test(id: string) {
    const { data } = await api.POST("/admin/data-sources/{sourceId}/test", {
      params: { path: { sourceId: id } },
    });
    setMsg(data ? `${data.ok ? "OK" : "Falha"} — ${data.message ?? ""} (${data.latencyMs}ms)` : "Erro");
  }

  async function save() {
    if (!editing) return;
    const body = {
      slug: editing.slug,
      name: editing.name,
      category: editing.category,
      driver: editing.driver,
      active: editing.active,
      credential: editing.credential || undefined,
      baseUrl: editing.baseUrl || undefined,
      modelName: editing.modelName || undefined,
      timeoutMs: editing.timeoutMs ?? undefined,
      rateLimitRpm: editing.rateLimitRpm ?? undefined,
    };
    if (editing.id) {
      await api.PATCH("/admin/data-sources/{sourceId}", {
        params: { path: { sourceId: editing.id } },
        body,
      });
    } else {
      await api.POST("/admin/data-sources", { body });
    }
    setEditing(null);
    await load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vendors, Modelos & Fontes</h1>
        <button
          type="button"
          className="rounded bg-accent px-3 py-1.5 text-sm text-white"
          onClick={() => setEditing({ ...EMPTY })}
        >
          Nova fonte
        </button>
      </div>
      {msg ? <p className="mb-3 text-sm">{msg}</p> : null}
      <div className="overflow-x-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="p-2">Nome</th>
              <th className="p-2">Driver</th>
              <th className="p-2">Credencial</th>
              <th className="p-2">Status</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.driver}</td>
                <td className="p-2 font-mono text-xs">
                  {r.isConfigured ? r.credentialHint : "—"}
                </td>
                <td className="p-2">
                  <span
                    className={
                      r.active
                        ? "rounded bg-green-100 px-2 py-0.5 text-green-800"
                        : "rounded bg-gray-100 px-2 py-0.5 text-gray-600"
                    }
                  >
                    {r.active ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="p-2 space-x-2">
                  <button type="button" className="text-accent underline" onClick={() => test(r.id)}>
                    Testar
                  </button>
                  <button
                    type="button"
                    className="text-muted underline"
                    onClick={() =>
                      setEditing({
                        ...r,
                        credential: "",
                        baseUrl: r.baseUrl ?? "",
                        modelName: r.modelName ?? "",
                        timeoutMs: r.timeoutMs ?? 15000,
                        rateLimitRpm: r.rateLimitRpm ?? 60,
                      })
                    }
                  >
                    Configurar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-lg space-y-3 rounded-lg bg-surface p-5"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <h2 className="text-lg font-semibold">{editing.id ? "Editar fonte" : "Nova fonte"}</h2>
            <input
              className="w-full rounded border border-border px-3 py-2 text-sm"
              placeholder="Slug"
              value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              required
            />
            <input
              className="w-full rounded border border-border px-3 py-2 text-sm"
              placeholder="Nome"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
            <div className="flex gap-2">
              <select
                className="flex-1 rounded border border-border px-2 py-2 text-sm"
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value as Source["category"] })
                }
              >
                <option value="MARKET">Mercado</option>
                <option value="LLM">LLM</option>
                <option value="GOVERNMENT">Governo</option>
              </select>
              <input
                className="flex-1 rounded border border-border px-3 py-2 text-sm"
                placeholder="Driver (BRAPI, OPENAI…)"
                value={editing.driver}
                onChange={(e) => setEditing({ ...editing, driver: e.target.value })}
                required
              />
            </div>
            <input
              className="w-full rounded border border-border px-3 py-2 text-sm"
              type="password"
              placeholder={
                editing.id ? "Novo token (vazio = preservar)" : "Token / API Key"
              }
              value={editing.credential}
              onChange={(e) => setEditing({ ...editing, credential: e.target.value })}
            />
            <input
              className="w-full rounded border border-border px-3 py-2 text-sm"
              placeholder="Base URL"
              value={editing.baseUrl ?? ""}
              onChange={(e) => setEditing({ ...editing, baseUrl: e.target.value })}
            />
            <input
              className="w-full rounded border border-border px-3 py-2 text-sm"
              placeholder="Modelo (gpt-4o-mini, claude-3-5-sonnet…)"
              value={editing.modelName ?? ""}
              onChange={(e) => setEditing({ ...editing, modelName: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 rounded border border-border px-3 py-2 text-sm"
                type="number"
                placeholder="Timeout ms"
                value={editing.timeoutMs ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, timeoutMs: Number(e.target.value) || null })
                }
              />
              <input
                className="flex-1 rounded border border-border px-3 py-2 text-sm"
                type="number"
                placeholder="Rate limit RPM"
                value={editing.rateLimitRpm ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, rateLimitRpm: Number(e.target.value) || null })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              />
              Ativa
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-1.5 text-sm" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button type="submit" className="rounded bg-accent px-4 py-1.5 text-sm text-white">
                Salvar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
