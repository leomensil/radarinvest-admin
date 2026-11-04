"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

type Connector = {
  slug: string;
  driver: string;
  lastOk?: boolean | null;
  lastLatencyMs?: number | null;
  lastCheckedAt?: string | null;
  successRate?: number | null;
};

export default function ObservabilityPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    void api.GET("/admin/observability").then(({ data }) => {
      const snap = data as { connectors?: Connector[] } | undefined;
      if (snap?.connectors) setConnectors(snap.connectors);
    });
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Status de Conectores</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="p-2">Fonte</th>
            <th className="p-2">Driver</th>
            <th className="p-2">Último teste</th>
            <th className="p-2">Latência</th>
            <th className="p-2">Taxa sucesso</th>
          </tr>
        </thead>
        <tbody>
          {connectors.map((c) => (
            <tr key={c.slug} className="border-b border-border">
              <td className="p-2">{c.slug}</td>
              <td className="p-2">{c.driver}</td>
              <td className="p-2">
                {c.lastOk == null ? "—" : c.lastOk ? "OK" : "Falha"}
              </td>
              <td className="p-2">{c.lastLatencyMs ?? "—"} ms</td>
              <td className="p-2">
                {c.successRate != null ? `${Math.round(c.successRate * 100)}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
