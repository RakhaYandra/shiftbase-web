import { useEffect, useState } from "react";
import { api, type Coverage, type Overtime } from "../api/client";
import { useAuth } from "../auth/auth";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function Reports() {
  const { token } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [ot, setOt] = useState<Overtime[]>([]);
  const [cov, setCov] = useState<Coverage[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) return;
    setErr("");
    api
      .overtime(token, from, to)
      .then(setOt)
      .catch((e: Error) => setErr(e.message));
    api
      .coverage(token, date)
      .then(setCov)
      .catch((e: Error) => setErr(e.message));
  }, [token, from, to, date]);

  const maxOt = Math.max(1, ...ot.map((o) => o.overtime_hours));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-bold tracking-tight">Laporan</h1>
      {err && <p className="text-sm font-semibold text-signal-deep">{err}</p>}

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-bold">Lembur</h2>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto" />
          <span className="text-ink/50">sampai</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-auto" />
        </div>
        <div className="border border-line rounded divide-y divide-line/60">
          {ot.map((o) => (
            <div key={o.employee_id} className="px-3 py-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{o.name}</span>
                <span className="tnum">
                  {o.total_hours} j · lembur {o.overtime_hours} j
                </span>
              </div>
              <div className="mt-1 h-2 rounded-sm bg-line/60">
                <div
                  className="h-2 rounded-sm bg-signal"
                  style={{ width: `${(o.overtime_hours / maxOt) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {ot.length === 0 && <p className="px-3 py-6 text-sm text-ink/60">Belum ada data lembur.</p>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-bold">Cakupan</h2>
          <Label>Tanggal (kosongkan = semua)</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        </div>
        <div className="border border-line rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink/60">
                <th className="px-3 py-2 font-semibold">Tanggal</th>
                <th className="px-3 py-2 font-semibold">Jumlah pegawai</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {cov.map((c) => (
                <tr key={c.date} className="border-b border-line/60 last:border-0">
                  <td className="px-3 py-2">{c.date}</td>
                  <td className="px-3 py-2">{c.headcount}</td>
                </tr>
              ))}
              {cov.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-ink/60">
                    Belum ada data cakupan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
