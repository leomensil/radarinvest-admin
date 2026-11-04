"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

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

export default function AiPrepPage() {
  const [rows, setRows] = useState<Source[]>([]);

  useEffect(() => {
    void api.GET("/admin/data-sources").then(({ data }) => {
      if (data) setRows((data as Source[]).filter((s) => s.category === "LLM"));
    });
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">IA — preparação (Inc. 13)</h1>
      <p className="mb-4 text-sm text-muted">
        Cadastro de provedores/modelos. Sem chamada paga neste incremento. Limite configurado ≠
        consumo medido ≠ valor faturado.
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
                  Nenhuma fonte LLM cadastrada — use Vendors &amp; credenciais (category LLM).
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
    </div>
  );
}
