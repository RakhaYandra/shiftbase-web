import { useEffect, useMemo, useState } from "react";
import { api, type Shift } from "../api/client";
import { useAuth } from "../auth/auth";
import { Input } from "../components/ui/input";

// Jendela papan: 06:00–24:00. Overnight tidak didukung BE (end > start).
const OPEN = 6 * 60;
const CLOSE = 24 * 60;

function mins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function todayWIB() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

export function Schedule() {
  const { token } = useAuth();
  const [date, setDate] = useState(todayWIB);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setError("");
    api
      .shifts(token, date)
      .then(setShifts)
      .catch((e: Error) => setError(e.message));
    api
      .employees(token)
      .then((list) => setNames(Object.fromEntries(list.map((e) => [e.id, e.name]))))
      .catch(() => setNames({}));
  }, [token, date]);

  const lanes = useMemo(() => {
    const g = new Map<number, Shift[]>();
    for (const s of shifts) {
      const arr = g.get(s.employee_id) ?? [];
      arr.push(s);
      g.set(s.employee_id, arr);
    }
    return [...g.entries()].sort((a, b) => a[0] - b[0]);
  }, [shifts]);

  const hours = Array.from({ length: (CLOSE - OPEN) / 60 }, (_, i) => OPEN / 60 + i);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-bold tracking-tight">Jadwal</h1>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
      </div>
      {error && <p className="text-sm font-semibold text-signal-deep">{error}</p>}
      {lanes.length === 0 && !error && (
        <p className="border border-line rounded p-6 text-sm text-ink/60">
          Belum ada shift tanggal ini. Manager dapat menambahkannya di halaman Shift (W2).
        </p>
      )}
      <div className="space-y-3">
        {lanes.map(([emp, list]) => (
          <div key={emp} className="border border-line rounded">
            <p className="border-b border-line px-3 py-1.5 text-sm font-semibold">
              {names[emp] ?? `Pegawai #${emp}`}
            </p>
            <div className="relative px-3 py-2">
              <div className="relative h-12">
                {hours.map((h) => (
                  <span
                    key={h}
                    className="absolute top-0 h-full border-l border-line/70 pl-1 text-[11px] text-ink/40 tnum"
                    style={{ left: `${((h * 60 - OPEN) / (CLOSE - OPEN)) * 100}%` }}
                  >
                    {String(h).padStart(2, "0")}
                  </span>
                ))}
                {list.map((s) => {
                  const left = ((mins(s.start_time) - OPEN) / (CLOSE - OPEN)) * 100;
                  const width = ((mins(s.end_time) - mins(s.start_time)) / (CLOSE - OPEN)) * 100;
                  return (
                    <div
                      key={s.id}
                      className="absolute top-5 h-7 rounded-sm bg-board text-paper text-xs font-semibold flex items-center px-2 tnum whitespace-nowrap overflow-hidden"
                      style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                      title={`${s.start_time}–${s.end_time}`}
                    >
                      {s.start_time}–{s.end_time}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
