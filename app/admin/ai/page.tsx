"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { adminFetch } from "@/lib/api/admin-fetch";

type Source = {
  id: string;
  slug: string;
  name: string;
  category: string;
  driver: string;
  active: boolean;
  isConfigured: boolean;
  credentialHint?: string | null;
  modelName?: string | null;
  rateLimitRpm?: number | null;
  timeoutMs?: number | null;
};

type Run = {
  id: string;
  adapter: string;
  status: string;
  modelName?: string | null;
  asOf: string;
  latencyMs?: number | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  estimatedCostUsd?: string | null;
  productionInsight: boolean;
  errorCode?: string | null;
  createdAt: string;
};

export default function AiPrepPage() {
  const [rows, setRows] = useState<Source[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    void api.GET("/admin/data-sources").then(({ data }) => {
      if (data) setRows((data as Source[]).filter((s) => s.category === "LLM"));
    });
    void adminFetch<Run[]>("/admin/ai/runs?limit=30")
      .then(setRuns)
      .catch(() => setRuns([]));
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">IA — preparação / execuções</h1>
      <p className="mb-4 text-sm text-muted">
        Provedores LLM + histórico de runs. Sem chamada paga. DETERMINISTIC ≠ produção. Credenciais
        nunca em claro.
      </p>
      <div className="overflow-x-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm" data-testid="admin-ai">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="p-2">Slug</th>
              <th className="p-2">Driver / modelo</th>
              <th className="p-2">Ativo</th>
              <th className="p-2">Credencial</th>
              <th className="p-2">Limite RPM</th>
              <th className="p-2">Consumo medido</th>
              <th className="p-2">Custo estimado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-2 text-muted" colSpan={7}>
                  Nenhuma fonte LLM cadastrada — use Vendors (category LLM).
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="p-2 font-mono text-xs">{r.slug}</td>
                  <td className="p-2 text-xs">
                    {r.driver}
                    {r.modelName ? ` / ${r.modelName}` : ""}
                  </td>
                  <td className="p-2">{r.active ? "sim" : "não"}</td>
                  <td className="p-2 text-xs">
                    {r.isConfigured ? r.credentialHint ?? "configurada" : "não configurada"}
                  </td>
                  <td className="p-2 font-mono text-xs">{r.rateLimitRpm ?? "—"}</td>
                  <td className="p-2 text-xs text-muted">sem dados</td>
                  <td className="p-2 text-xs text-muted">n/a</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 mt-6 text-sm font-semibold">Execuções recentes</h2>
      <div className="overflow-x-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm" data-testid="admin-ai-runs">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="p-2">Quando</th>
              <th className="p-2">Adapter</th>
              <th className="p-2">Status</th>
              <th className="p-2">Latência</th>
              <th className="p-2">Tokens</th>
              <th className="p-2">Prod</th>
              <th className="p-2">Erro</th>
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 ? (
              <tr>
                <td className="p-2 text-muted" colSpan={7}>
                  Sem runs.
                </td>
              </tr>
            ) : (
              runs.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="p-2 text-xs whitespace-nowrap">{r.createdAt.slice(0, 19)}</td>
                  <td className="p-2 text-xs">{r.adapter}</td>
                  <td className="p-2 text-xs">{r.status}</td>
                  <td className="p-2 font-mono text-xs">{r.latencyMs ?? "—"}</td>
                  <td className="p-2 font-mono text-xs">
                    {r.promptTokens ?? "—"}/{r.completionTokens ?? "—"}
                  </td>
                  <td className="p-2 text-xs">{String(r.productionInsight)}</td>
                  <td className="p-2 text-xs text-red-700">{r.errorCode ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
