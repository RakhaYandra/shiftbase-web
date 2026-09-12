# shiftbase-web

Papan roster untuk shiftbase API — Vite + React + TS + Tailwind v4 + shadcn.

> Status: W1 — Login + Jadwal (lajur waktu). Shift, Absensi, Laporan di W2.

## Dev

```bash
npm install
cp .env.example .env            # VITE_API_URL=http://localhost:8080
npm run dev                     # :5173
```

Butuh API + DB repo 1 (`RakhaYandra/shiftbase`) jalan + `FRONTEND_URL=http://localhost:5173`.
Login seed: `admin@shiftbase.local / Admin123!`.

## Cek

```bash
npx tsc -b && npm run build
```
