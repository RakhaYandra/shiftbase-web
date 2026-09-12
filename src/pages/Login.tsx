import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
}

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@shiftbase.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const clock = useClock();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Email atau kata sandi salah.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-between bg-board p-8 text-paper">
        <p className="font-display text-xl font-extrabold tracking-tight">shiftbase</p>
        <div>
          <p className="font-display font-extrabold leading-none tracking-tight tnum text-[clamp(4rem,12vw,8rem)]">
            {clock}
          </p>
          <p className="mt-2 text-paper/70">Jam operasional — WIB. Masuk untuk melihat papan roster hari ini.</p>
        </div>
        <p className="text-sm text-paper/50">Data contoh fiktif untuk portofolio.</p>
      </div>
      <div className="flex items-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <h1 className="font-display text-2xl font-bold tracking-tight">Masuk</h1>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Kata sandi</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm font-semibold text-signal-deep">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Memeriksa…" : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
