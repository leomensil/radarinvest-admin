"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";

type RouteRow = {
  featureKey: string;
  label?: string;
  isActive: boolean;
  primarySourceId?: string | null;
  fallbackSourceId?: string | null;
};

type Source = {
  id: string;
  slug: string;
  name: string;
  category: string;
  active: boolean;
};

const MARKET_KEYS = new Set([
  "MARKET_CLOSES_D0",
  "INTRADAY_QUOTES",
  "DIVIDENDS_EVENTS",
]);
const GOV_KEYS = new Set([
  "TREASURY_RATES",
  "INTEREST_CURVE_ETTJ",
  "COMPANY_FUNDAMENTALS",
]);

function compatible(featureKey: string, category: string) {
  if (featureKey === "AI_DIAGNOSIS") return category === "LLM";
  if (MARKET_KEYS.has(featureKey)) return category === "MARKET";
  if (GOV_KEYS.has(featureKey)) return category === "GOVERNMENT" || category === "MARKET";
  return true;
}

export default function MatrixPage() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const [m, s] = await Promise.all([
      api.GET("/admin/feature-matrix"),
      api.GET("/admin/data-sources"),
    ]);
    if (m.data) setRoutes(m.data as RouteRow[]);
    if (s.data) setSources(s.data as Source[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateRow(i: number, patch: Partial<RouteRow>) {
    setRoutes((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function save() {
    if (!window.confirm("Salvar matriz? Efeito imediato no runtime.")) return;
    const { error } = await api.PUT("/admin/feature-matrix", { body: routes });
    setSaved(!error);
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Matriz de Roteamento</h1>
      <button
        type="button"
        onClick={() => void save()}
        className="mb-4 rounded bg-accent px-4 py-2 text-sm text-white"
      >
        Salvar matriz
      </button>
      {saved ? <p className="mb-2 text-sm text-green-800">Salvo. Cache invalidado.</p> : null}
      <div className="space-y-3">
        {routes.map((row, i) => {
          const opts = sources.filter((s) => s.active && compatible(row.featureKey, s.category));
          return (
            <div key={row.featureKey} className="rounded border border-border bg-surface p-3 text-sm">
              <div className="mb-2 font-medium">{row.label ?? row.featureKey}</div>
              <label className="mr-4 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.isActive}
                  onChange={(e) => updateRow(i, { isActive: e.target.checked })}
                />
                Ativa
              </label>
              <label className="mr-2">Primária</label>
              <select
                className="mr-4 rounded border border-border px-2 py-1"
                value={row.primarySourceId ?? ""}
                onChange={(e) => updateRow(i, { primarySourceId: e.target.value || null })}
              >
                <option value="">—</option>
                {opts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
              <label className="mr-2">Fallback</label>
              <select
                className="rounded border border-border px-2 py-1"
                value={row.fallbackSourceId ?? ""}
                onChange={(e) => updateRow(i, { fallbackSourceId: e.target.value || null })}
              >
                <option value="">—</option>
                {opts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
