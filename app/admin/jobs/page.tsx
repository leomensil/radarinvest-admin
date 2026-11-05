"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-fetch";

const CAPS = [
  "CDI",
  "IPCA",
  "SELIC",
  "TREASURY_PU",
  "ETTJ",
  "IPCA_PROJ",
  "LISTED_CLOSE",
] as const;

type Run = {
  id: string;
  capability: string;
  status: string;
  startedAt: string;
  finishedAt?: string | null;
  observationsUpserted?: number | null;
  observationsRevised?: number | null;
  errorCode?: string | null;
  metrics?: Record<string, unknown> | null;
};

type Orch = {
  productionCronEnabled: boolean;
  slotRoles: { slot: string; role: string }[];
  capabilities: {
    capability: string;
    phases: string[];
    consumers: string[];
  }[];
};

export default function JobsPage() {
  const [rows, setRows] = useState<Run[]>([]);
  const [orch, setOrch] = useState<Orch | null>(null);
  const [cap, setCap] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const q = cap ? `?capability=${encodeURIComponent(cap)}` : "";
    const [data, graph] = await Promise.all([
      adminFetch<Run[]>(`/admin/series-ingest/runs${q}`),
      adminFetch<Orch>("/admin/series-ingest/orchestration"),
    ]);
    setRows(data);
    setOrch(graph);
  }, [cap]);

  useEffect(() => {
    void load().catch((e: Error) => setMsg(e.message));
  }, [load]);

  async function trigger(capability: string) {
    if (
      !window.confirm(
        `Disparar coleta manual de ${capability}? Ambiente de teste apenas — não ativa cron de produção. Duplicata RUNNING retorna conflito.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await adminFetch<Run>("/admin/series-ingest/runs", {
        method: "POST",
        body: JSON.stringify({ capability }),
      });
      setMsg(`Trigger ${capability} aceito (202).`);
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Jobs de ingestão</h1>
      <p className="mb-4 text-sm text-muted">
        Histórico durable `series_ingest_runs`. Token/licença/fonte indisponível ≠ falha de cálculo.
        Cron produção: {orch?.productionCronEnabled ? "ON" : "OFF"}.
        PU Venda Manhã ≠ fechamento de sessão.
      </p>
      {orch ? (
        <div
          className="mb-4 rounded border border-border bg-surface p-3 text-xs"
          data-testid="admin-orchestration"
        >
          <p className="mb-2 font-medium">Orquestração (Inc.5)</p>
          <p className="mb-1">
            Slots:{" "}
            {orch.slotRoles.map((s) => `${s.slot}=${s.role}`).join(" · ")}
          </p>
          <ul className="list-inside list-disc text-muted">
            {orch.capabilities.slice(0, 4).map((c) => (
              <li key={c.capability}>
                {c.capability}: {c.phases.join("→")} · consumidores{" "}
                {c.consumers.join(", ")}
              </li>
            ))}
            {orch.capabilities.length > 4 ? (
              <li>+{orch.capabilities.length - 4} capacidades…</li>
            ) : null}
          </ul>
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="rounded border border-border px-2 py-1 text-sm"
          value={cap}
          onChange={(e) => setCap(e.target.value)}
        >
          <option value="">Todas</option>
          {CAPS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {CAPS.map((c) => (
          <button
            key={c}
            type="button"
            disabled={busy}
            className="rounded border border-border px-2 py-1 text-xs hover:bg-bg disabled:opacity-50"
            onClick={() => void trigger(c)}
          >
            Rodar {c}
          </button>
        ))}
      </div>
      {msg ? <p className="mb-3 text-sm">{msg}</p> : null}
      <div className="overflow-x-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm" data-testid="admin-jobs">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="p-2">Capacidade</th>
              <th className="p-2">Status</th>
              <th className="p-2">Início</th>
              <th className="p-2">Upsert/Rev</th>
              <th className="p-2">Erro</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border">
                <td className="p-2 font-mono text-xs">{r.capability}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 text-xs">{r.startedAt?.slice(0, 19)}</td>
                <td className="p-2 text-xs">
                  {r.observationsUpserted ?? "—"}/{r.observationsRevised ?? "—"}
                </td>
                <td className="p-2 text-xs text-red-700">{r.errorCode ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
