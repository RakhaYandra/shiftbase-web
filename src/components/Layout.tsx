import type { ReactNode } from "react";
import { useAuth } from "../auth/auth";
import { Button } from "./ui/button";

export type Page = "schedule" | "shifts" | "attendance" | "reports";

const NAV: { id: Page; label: string; roles: string[] }[] = [
  { id: "schedule", label: "Jadwal", roles: ["admin", "manager", "staff"] },
  { id: "shifts", label: "Shift", roles: ["admin", "manager"] },
  { id: "attendance", label: "Absensi", roles: ["admin", "manager", "staff"] },
  { id: "reports", label: "Laporan", roles: ["admin", "manager"] },
];

export function Layout({
  page,
  go,
  children,
}: {
  page: Page;
  go: (p: Page) => void;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const today = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight">shiftbase</p>
            <p className="text-sm text-ink/60 tnum">{today} · WIB</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink/60">{user?.email}</span>
            <Button variant="outline" onClick={logout}>
              Keluar
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4 pb-3">
          {NAV.filter((n) => user && n.roles.includes(user.role)).map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`rounded px-3 py-1.5 text-sm font-semibold ${
                page === n.id ? "bg-board text-paper" : "hover:bg-line/60"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
