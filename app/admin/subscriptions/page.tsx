"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

type SubRow = {
  id: string;
  userEmail: string;
  plan: string;
  status: string;
  currentPeriodEnd?: string | null;
};

export default function SubscriptionsPage() {
  const [rows, setRows] = useState<SubRow[]>([]);

  async function load() {
    const { data } = await api.GET("/admin/subscriptions");
    if (data) setRows(data as SubRow[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function patch(
    id: string,
    body: { plan?: "CORE" | "EXPERT"; status?: "trialing" | "active" | "past_due" | "canceled" | "expired" },
  ) {
    await api.PATCH("/admin/subscriptions/{subscriptionId}", {
      params: { path: { subscriptionId: id } },
      body,
    });
    await load();
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Planos & Assinaturas</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="p-2">Usuário</th>
            <th className="p-2">Plano</th>
            <th className="p-2">Status</th>
            <th className="p-2">Período até</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="border-b border-border">
              <td className="p-2">{s.userEmail}</td>
              <td className="p-2">
                <select
                  className="rounded border border-border px-1 py-0.5"
                  value={s.plan}
                  onChange={(e) => void patch(s.id, { plan: e.target.value as "CORE" | "EXPERT" })}
                >
                  <option value="CORE">CORE</option>
                  <option value="EXPERT">EXPERT</option>
                </select>
              </td>
              <td className="p-2">
                <select
                  className="rounded border border-border px-1 py-0.5"
                  value={s.status}
                  onChange={(e) =>
                    void patch(s.id, {
                      status: e.target.value as
                        | "trialing"
                        | "active"
                        | "past_due"
                        | "canceled"
                        | "expired",
                    })
                  }
                >
                  <option value="trialing">trialing</option>
                  <option value="active">active</option>
                  <option value="past_due">past_due</option>
                  <option value="canceled">canceled</option>
                  <option value="expired">expired</option>
                </select>
              </td>
              <td className="p-2">{s.currentPeriodEnd?.slice(0, 10) ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
