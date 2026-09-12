import { useEffect, useState } from "react";
import { api, importCSV, type Attendance, type Employee, type ImportResult } from "../api/client";
import { useAuth } from "../auth/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

function day(offset: number) {
  const d = new Date(Date.now() + offset * 864e5);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(d);
}

export function Attendance() {
  const { token, user } = useAuth();
  const isStaff = user?.role === "staff";
  const [from, setFrom] = useState(day(-7));
  const [to, setTo] = useState(day(0));
  const [emp, setEmp] = useState(0);
  const [emps, setEmps] = useState<Employee[]>([]);
  const [rows, setRows] = useState<Attendance[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imp, setImp] = useState<ImportResult | null>(null);

  useEffect(() => {
    if (!token || isStaff) return;
    api.employees(token).then(setEmps).catch(() => setEmps([]));
  }, [token, isStaff]);

  function load() {
    if (!token) return;
    setErr("");
    api
      .attendance(token, from, to, !isStaff && emp ? emp : undefined)
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }
  useEffect(load, [token, from, to, emp, isStaff]);

  async function punch(kind: "in" | "out") {
    if (!token) return;
    setErr("");
    setMsg("");
    try {
      const id = !isStaff && emp ? emp : undefined;
      const r = kind === "in" ? await api.checkIn(token, id) : await api.checkOut(token, id);
      setMsg(r.status === "checked_in" ? "Masuk tercatat." : "Keluar tercatat.");
      load();
    } catch (e) {
      const m = (e as Error).message;
      setErr(
        m === "attendance_duplicate"
          ? "Sudah tercatat masuk hari ini."
          : m === "no_open_checkin"
            ? "Belum ada catatan masuk hari ini."
            : m === "employee_id wajib"
              ? "Pilih pegawai dulu."
              : m
      );
    }
  }

  async function doImport(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !file) return;
    setErr("");
    setImp(null);
    try {
      setImp(await importCSV(token, file));
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-bold tracking-tight">Absensi</h1>

      <div className="flex flex-wrap items-end gap-3">
        {!isStaff && (
          <div className="space-y-1">
            <Label>Pegawai</Label>
            <select
              className="h-10 rounded border border-line bg-paper px-3 text-sm focus:border-board focus:outline-none"
              value={emp}
              onChange={(e) => setEmp(Number(e.target.value))}
            >
              <option value={0}>{isStaff ? "" : "Semua"}</option>
              {emps.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button onClick={() => punch("in")}>Catat masuk</Button>
        <Button variant="outline" onClick={() => punch("out")}>
          Catat keluar
        </Button>
      </div>
      {msg && <p className="text-sm font-semibold text-board">{msg}</p>}
      {err && <p className="text-sm font-semibold text-signal-deep">{err}</p>}

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-bold">Riwayat</h2>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto" />
          <span className="text-ink/50">sampai</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-auto" />
        </div>
        <div className="border border-line rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink/60">
                <th className="px-3 py-2 font-semibold">Tanggal</th>
                <th className="px-3 py-2 font-semibold">Masuk</th>
                <th className="px-3 py-2 font-semibold">Keluar</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-line/60 last:border-0">
                  <td className="px-3 py-2">{a.date}</td>
                  <td className="px-3 py-2">{a.check_in || "—"}</td>
                  <td className="px-3 py-2">{a.check_out || "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-ink/60">
                    Belum ada catatan pada rentang ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isStaff && (
        <div className="space-y-2">
          <h2 className="font-display font-bold">Impor pegawai (CSV)</h2>
          <form onSubmit={doImport} className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label>Berkas, maks 2 MB — header: name,email,phone,position,hire_date</Label>
              <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-auto" />
            </div>
            <Button type="submit" variant="outline">
              Impor
            </Button>
          </form>
          {imp && (
            <div className="border border-line rounded p-3 text-sm">
              <p>
                Masuk <strong className="tnum">{imp.imported}</strong>, gagal{" "}
                <strong className="tnum">{imp.failed}</strong>.
              </p>
              {(imp.errors ?? []).length > 0 && (
                <ul className="mt-2 space-y-1">
                  {imp.errors!.map((x) => (
                    <li key={x.row} className="tnum">
                      Baris {x.row}: {x.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
