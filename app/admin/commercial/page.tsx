"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

type Sub = {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  status: string;
  currentPeriodEnd?: string | null;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  trialEndsAt?: string | null;
};

export default function CommercialAdminPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [s, u] = await Promise.all([
        api.GET("/admin/subscriptions"),
        api.GET("/admin/users"),
      ]);
      if (s.data) setSubs(s.data as Sub[]);
      if (u.data) setUsers(u.data as UserRow[]);
    })();
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Comercial (leitura)</h1>
      <p className="mb-4 text-sm text-muted">
        Situação de trial/assinatura sem patrimônio. Preços, gateway e inadimplência: decisões
        abertas (PEND-002/003/004). Sem defaults fictícios.
      </p>
      {msg ? <p className="mb-2 text-sm">{msg}</p> : null}

      <h2 className="mb-2 text-sm font-semibold">Assinaturas</h2>
      <div className="mb-6 overflow-x-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm" data-testid="admin-commercial-subs">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="p-2">E-mail</th>
              <th className="p-2">Plano</th>
              <th className="p-2">Status</th>
              <th className="p-2">Período</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-border">
                <td className="p-2 text-xs">{s.userEmail}</td>
                <td className="p-2">{s.plan}</td>
                <td className="p-2">{s.status}</td>
                <td className="p-2 text-xs">{s.currentPeriodEnd?.slice(0, 10) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 text-sm font-semibold">Trial (users)</h2>
      <div className="overflow-x-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm" data-testid="admin-commercial-users">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="p-2">E-mail</th>
              <th className="p-2">Role</th>
              <th className="p-2">Trial até</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border">
                <td className="p-2 text-xs">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 text-xs">{u.trialEndsAt?.slice(0, 10) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">
        Mutações de role/trial em Usuários geram auditoria. Concessão arbitraria de assinatura não
        é produto deste corte.
      </p>
      <button
        type="button"
        className="mt-2 text-xs text-muted underline"
        onClick={() =>
          setMsg(
            "Checkout/gateway ausentes (PEND-003). Nenhuma ação de cobrança disponível.",
          )
        }
      >
        Por que não há cobrança aqui?
      </button>
    </div>
  );
}
