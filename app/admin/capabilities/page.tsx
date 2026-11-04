"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-fetch";

type Cap = {
  featureKey: string;
  label: string;
  enabled: boolean;
  adapterImplemented: boolean;
  accessConfigured: boolean;
  testedWithFixture: boolean;
  liveQueryVerified: boolean;
  operationalHomologation: string;
  commercialUseStatus: string;
  primarySlug?: string | null;
  fallbackSlug?: string | null;
  lastRunAt?: string | null;
  lastRunStatus?: string | null;
  lastError?: string | null;
  coverageNote?: string;
};

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? "text-accent" : "text-muted"}>
      {ok ? "●" : "○"} {label}
    </span>
  );
}

export default function CapabilitiesPage() {
  const [rows, setRows] = useState<Cap[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void adminFetch<Cap[]>("/admin/capabilities")
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Fontes / capacidades</h1>
      <p className="mb-4 text-sm text-muted">
        Estados distintos: habilitada ≠ adaptador ≠ acesso ≠ teste ≠ homologação ≠ comercial.
        Toggle na matriz não declara homologação.
      </p>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <div className="overflow-x-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm" data-testid="admin-capabilities">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="p-2">Capacidade</th>
              <th className="p-2">Fonte</th>
              <th className="p-2">Estados</th>
              <th className="p-2">Última coleta</th>
              <th className="p-2">Homologação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.featureKey} className="border-b border-border align-top">
                <td className="p-2">
                  <p className="font-medium">{r.label}</p>
                  <p className="font-mono text-xs text-muted">{r.featureKey}</p>
                </td>
                <td className="p-2 text-xs">
                  <p>{r.primarySlug ?? "—"}</p>
                  {r.fallbackSlug ? <p className="text-muted">fb: {r.fallbackSlug}</p> : null}
                </td>
                <td className="p-2 text-xs space-y-0.5">
                  <div>
                    <Flag ok={r.enabled} label="habilitada" />
                  </div>
                  <div>
                    <Flag ok={r.adapterImplemented} label="adaptador" />
                  </div>
                  <div>
                    <Flag ok={r.accessConfigured} label="acesso" />
                  </div>
                  <div>
                    <Flag ok={r.testedWithFixture} label="fixture" />
                  </div>
                  <div>
                    <Flag ok={r.liveQueryVerified} label="live" />
                  </div>
                </td>
                <td className="p-2 text-xs">
                  <p>{r.lastRunStatus ?? "—"}</p>
                  <p className="text-muted">{r.lastRunAt?.slice(0, 19) ?? ""}</p>
                  {r.lastError ? <p className="text-red-700">{r.lastError}</p> : null}
                </td>
                <td className="p-2 text-xs">
                  <p>{r.operationalHomologation}</p>
                  <p className="text-muted">{r.commercialUseStatus}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
