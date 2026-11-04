"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-fetch";

type Overview = {
  sourcesActive: number;
  sourcesTotal: number;
  featuresEnabled: number;
  productionCron: boolean;
  recentRuns?: { id: string; capability: string; status: string; startedAt: string }[];
  recentAudit?: { reason?: string | null; at: string; tableName: string }[];
};

export default function OpsOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void adminFetch<Overview>("/admin/ops/overview")
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Visão operacional</h1>
      <p className="mb-4 text-sm text-muted">
        Fontes, jobs e auditoria. Cron de produção permanece desligado.
      </p>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      {data ? (
        <div className="grid gap-3 sm:grid-cols-3" data-testid="admin-ops-overview">
          <div className="rounded border border-border bg-surface p-4">
            <p className="text-xs text-muted">Fontes ativas</p>
            <p className="font-mono text-xl">
              {data.sourcesActive}/{data.sourcesTotal}
            </p>
          </div>
          <div className="rounded border border-border bg-surface p-4">
            <p className="text-xs text-muted">Capacidades habilitadas</p>
            <p className="font-mono text-xl">{data.featuresEnabled}</p>
          </div>
          <div className="rounded border border-border bg-surface p-4">
            <p className="text-xs text-muted">Cron produção</p>
            <p className="font-mono text-xl">{data.productionCron ? "ON" : "OFF"}</p>
          </div>
        </div>
      ) : null}
      {data?.recentRuns?.length ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Jobs recentes</h2>
          <ul className="space-y-1 text-sm">
            {data.recentRuns.map((r) => (
              <li key={r.id} className="font-mono text-xs">
                {r.capability} · {r.status} · {r.startedAt}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {data?.recentAudit?.length ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Auditoria recente</h2>
          <ul className="space-y-1 text-sm">
            {data.recentAudit.map((a, i) => (
              <li key={`${a.at}-${i}`} className="text-xs text-muted">
                {a.at} · {a.tableName} · {a.reason ?? "—"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
