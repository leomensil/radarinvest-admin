"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-fetch";

type Run = {
  id: string;
  capability: string;
  status: string;
  startedAt: string;
  observationsUpserted?: number | null;
  observationsRevised?: number | null;
  errorCode?: string | null;
};

export default function QualityPage() {
  const [rows, setRows] = useState<Run[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void adminFetch<Run[]>("/admin/series-ingest/runs")
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, []);

  const failed = rows.filter((r) => r.status === "FAILED" || r.status === "SKIPPED");
  const succeeded = rows.filter((r) => r.status === "SUCCEEDED");
  const revised = rows.filter((r) => (r.observationsRevised ?? 0) > 0);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Qualidade / revisões</h1>
      <p className="mb-4 text-sm text-muted">
        Cobertura e revisões a partir das corridas. Sem gráficos fictícios.
      </p>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-border bg-surface p-3">
          <p className="text-xs text-muted">Sucesso (amostra)</p>
          <p className="font-mono text-lg">{succeeded.length}</p>
        </div>
        <div className="rounded border border-border bg-surface p-3">
          <p className="text-xs text-muted">Falhas / skip</p>
          <p className="font-mono text-lg">{failed.length}</p>
        </div>
        <div className="rounded border border-border bg-surface p-3">
          <p className="text-xs text-muted">Com revisões</p>
          <p className="font-mono text-lg">{revised.length}</p>
        </div>
      </div>
      <h2 className="mb-2 text-sm font-semibold">Revisões recentes</h2>
      <ul className="space-y-1 text-sm" data-testid="admin-quality">
        {revised.length === 0 ? (
          <li className="text-muted">Nenhuma revisão na amostra.</li>
        ) : (
          revised.map((r) => (
            <li key={r.id} className="font-mono text-xs">
              {r.capability} · rev={r.observationsRevised} · {r.startedAt.slice(0, 19)}
            </li>
          ))
        )}
      </ul>
      <h2 className="mb-2 mt-6 text-sm font-semibold">Falhas sanitizadas</h2>
      <ul className="space-y-1 text-sm">
        {failed.map((r) => (
          <li key={r.id} className="text-xs">
            {r.capability} · {r.status} · {r.errorCode ?? "sem código"}
          </li>
        ))}
      </ul>
    </div>
  );
}
