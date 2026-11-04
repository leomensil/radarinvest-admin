"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-fetch";

type Entry = {
  id: string;
  tableName: string;
  recordId: string;
  actorUserId?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  at: string;
};

export default function AuditPage() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void adminFetch<Entry[]>("/admin/audit?limit=100")
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Auditoria</h1>
      <p className="mb-4 text-sm text-muted">
        Ator, ação, alvo, data e campos sanitizados. Segredos nunca listados.
      </p>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <div className="overflow-x-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm" data-testid="admin-audit">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="p-2">Quando</th>
              <th className="p-2">Razão</th>
              <th className="p-2">Tabela</th>
              <th className="p-2">Registro</th>
              <th className="p-2">Ator</th>
              <th className="p-2">Diff</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border align-top">
                <td className="p-2 text-xs whitespace-nowrap">{r.at.slice(0, 19)}</td>
                <td className="p-2 text-xs">{r.reason ?? "—"}</td>
                <td className="p-2 font-mono text-xs">{r.tableName}</td>
                <td className="p-2 font-mono text-xs">{r.recordId.slice(0, 8)}…</td>
                <td className="p-2 font-mono text-xs">
                  {r.actorUserId ? `${r.actorUserId.slice(0, 8)}…` : "—"}
                </td>
                <td className="p-2 font-mono text-[10px] text-muted max-w-md break-all">
                  {JSON.stringify({ before: r.before, after: r.after }).slice(0, 280)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
