import { useEffect, useState } from "react";
import { api, type Employee, type Shift, type ShiftIn } from "../api/client";
import { useAuth } from "../auth/auth";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const empty: ShiftIn = { employee_id: 0, date: "", start_time: "08:00", end_time: "16:00" };

export function Shifts() {
  const { token } = useAuth();
  const [date, setDate] = useState(() =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date())
  );
  const [rows, setRows] = useState<Shift[]>([]);
  const [emps, setEmps] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [form, setForm] = useState<ShiftIn>(empty);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    if (!token) return;
    api
      .shifts(token, date)
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }

  useEffect(() => {
    if (!token) return;
    api.employees(token).then(setEmps).catch(() => setEmps([]));
  }, [token]);
  useEffect(load, [token, date]);

  function startCreate() {
    setEditing(null);
    setForm({ ...empty, date });
    setError("");
    setOpen(true);
  }

  function startEdit(s: Shift) {
    setEditing(s);
    setForm({ employee_id: s.employee_id, date: s.date, start_time: s.start_time, end_time: s.end_time });
    setError("");
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      if (editing) await api.updateShift(token, editing.id, form);
      else await api.createShift(token, form);
      setOpen(false);
      setNotice(editing ? "Shift diperbarui." : "Shift ditambahkan.");
      load();
    } catch (err) {
      setError(
        (err as Error).message === "shift_conflict"
          ? "Jam bertabrakan dengan shift lain pegawai ini di tanggal yang sama. Geser jam mulai atau selesai."
          : (err as Error).message
      );
    }
  }

  async function remove(s: Shift) {
    if (!token || !confirm(`Hapus shift ${s.date} ${s.start_time}–${s.end_time}?`)) return;
    await api.deleteShift(token, s.id);
    setNotice("Shift dihapus.");
    load();
  }

  const name = (id: number) => emps.find((e) => e.id === id)?.name ?? `Pegawai #${id}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-bold tracking-tight">Shift</h1>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        <span className="flex-1" />
        <Button onClick={startCreate}>Tambah shift</Button>
      </div>
      {notice && <p className="text-sm font-semibold text-board">{notice}</p>}
      <div className="border border-line rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/60">
              <th className="px-3 py-2 font-semibold">Pegawai</th>
              <th className="px-3 py-2 font-semibold">Tanggal</th>
              <th className="px-3 py-2 font-semibold">Jam</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="tnum">
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-line/60 last:border-0">
                <td className="px-3 py-2">{name(s.employee_id)}</td>
                <td className="px-3 py-2">{s.date}</td>
                <td className="px-3 py-2">
                  {s.start_time}–{s.end_time}
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="mr-3 font-semibold hover:underline" onClick={() => startEdit(s)}>
                    Ubah
                  </button>
                  <button className="font-semibold text-signal-deep hover:underline" onClick={() => remove(s)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-ink/60">
                  Belum ada shift tanggal ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Ubah shift" : "Tambah shift"}>
        <form onSubmit={save} className="space-y-3">
          <div className="space-y-1">
            <Label>Pegawai</Label>
            <select
              className="h-10 w-full rounded border border-line bg-paper px-3 text-sm focus:border-board focus:outline-none"
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })}
              required
            >
              <option value={0} disabled>
                Pilih pegawai
              </option>
              {emps.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.position}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Tanggal</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Mulai</Label>
              <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>Selesai</Label>
              <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
            </div>
          </div>
          {error && <p className="text-sm font-semibold text-signal-deep">{error}</p>}
          <Button type="submit" className="w-full">
            Simpan
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
