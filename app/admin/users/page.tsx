"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  trialEndsAt?: string | null;
};

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<UserRow[]>([]);

  async function load(query: string) {
    const { data } = await api.GET("/admin/users", {
      params: { query: query ? { q: query } : {} },
    });
    if (data) setRows(data as UserRow[]);
  }

  useEffect(() => {
    void load(q);
  }, [q]);

  async function patch(id: string, body: { trialEndsAt?: string | null; role?: "USER" | "AUDITOR" | "SUPPORT" | "SUPER_ADMIN" }) {
    await api.PATCH("/admin/users/{userId}", {
      params: { path: { userId: id } },
      body,
    });
    await load(q);
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Usuários</h1>
      <p className="mb-4 text-sm text-muted">
        Dados mínimos (e-mail, nome, role, trial). Sem carteiras nem patrimônio. Mudança de papel
        exige SUPER_ADMIN e gera auditoria; autoelevação bloqueada na API.
      </p>
      <input
        placeholder="Buscar e-mail ou nome"
        className="mb-4 w-full max-w-md rounded border border-border px-3 py-2 text-sm"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="p-2">E-mail</th>
            <th className="p-2">Nome</th>
            <th className="p-2">Role</th>
            <th className="p-2">Trial até</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-border">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2">
                <select
                  className="rounded border border-border px-1 py-0.5"
                  value={u.role}
                  onChange={(e) =>
                    void patch(u.id, {
                      role: e.target.value as "USER" | "AUDITOR" | "SUPPORT" | "SUPER_ADMIN",
                    })
                  }
                >
                  <option value="USER">USER</option>
                  <option value="AUDITOR">AUDITOR</option>
                  <option value="SUPPORT">SUPPORT</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </td>
              <td className="p-2">{u.trialEndsAt?.slice(0, 10) ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
