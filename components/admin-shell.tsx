"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, loadStoredToken, setAccessToken } from "@/lib/api/client";

const SECTIONS = [
  {
    title: "Operação",
    items: [
      { href: "/admin", label: "Visão operacional" },
      { href: "/admin/capabilities", label: "Fontes / capacidades" },
      { href: "/admin/jobs", label: "Jobs" },
      { href: "/admin/quality", label: "Qualidade" },
    ],
  },
  {
    title: "Acesso",
    items: [
      { href: "/admin/users", label: "Usuários" },
      { href: "/admin/commercial", label: "Comercial (leitura)" },
      { href: "/admin/subscriptions", label: "Trial / entitlements" },
    ],
  },
  {
    title: "Integrações",
    items: [
      { href: "/admin/data-sources", label: "Vendors & credenciais" },
      { href: "/admin/matrix", label: "Matriz roteamento" },
      { href: "/admin/ai", label: "IA (prep)" },
    ],
  },
  {
    title: "Controle",
    items: [
      { href: "/admin/audit", label: "Auditoria" },
      { href: "/admin/observability", label: "Conectores" },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = loadStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setAccessToken(token);
    void api.GET("/me").then(({ data, error }) => {
      if (error || data?.role !== "SUPER_ADMIN") {
        setAccessToken(null);
        router.replace("/login");
        return;
      }
      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return <div className="p-8 text-sm text-muted">Validando sessão…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-surface p-4">
        <p className="mb-4 text-sm font-semibold">RadarInvest Admin</p>
        <p className="mb-4 text-xs text-muted">Separado do app investidor · SUPER_ADMIN</p>
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted">{section.title}</p>
            <nav className="flex flex-col gap-1 text-sm">
              {section.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "rounded bg-accent/10 px-2 py-1.5 font-medium text-accent"
                        : "rounded px-2 py-1.5 text-muted hover:bg-bg"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
