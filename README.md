# shiftbase-web

Papan roster untuk shiftbase API — Vite + React + TS + Tailwind v4 + shadcn.
Desain: terang, bidang datar, lajur waktu sebagai elemen khas (tanpa gradien,
tanpa kartu-shadow, tanpa emoji).

## Dev 5 menit

```bash
npm install
cp .env.example .env            # VITE_API_URL=http://localhost:8080
npm run dev                     # :5173
```

Butuh repo 1 (`RakhaYandra/shiftbase`): API + MySQL + seed jalan, dengan
`FRONTEND_URL=http://localhost:5173`.
Login seed: `admin@shiftbase.local / Admin123!`,
`manager@shiftbase.local / Manager123!`, `staff@shiftbase.local / Staff123!`.

## Halaman & peran

| Halaman | admin | manager | staff |
|---|---|---|---|
| Jadwal (lajur waktu) | ✅ | ✅ | ✅ miliknya |
| Shift (CRUD, bentrok→pesan jelas) | ✅ | ✅ | ❌ |
| Absensi (catat + riwayat + impor CSV) | ✅ | ✅ | ✅ miliknya |
| Laporan (lembur + cakupan) | ✅ | ✅ | ❌ |

Token JWT di `localStorage` (`shiftbase_token`); 401 → keluar otomatis.

## Cek & CI

```bash
npx tsc -b && npm run lint && npm run build
```

CI: Node 22 → `npm ci` → tsc → oxlint → build.
