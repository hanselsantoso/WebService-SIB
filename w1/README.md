# SOA Minggu 1 — Pengantar Web Service & Review JavaScript

Demo praktikum Mata Kuliah Arsitektur Berbasis Layanan (SOA)
S1 Sistem Informasi Bisnis — ISTTS

Minggu ini **belum ada project yang dibangun mahasiswa** — isinya demo
perkenalan web service dan review JavaScript yang menjadi fondasi seluruh
semester. Penjelasan materi dan langkah install ada di
**[PANDUAN.md](PANDUAN.md)**.

## Menjalankan demo

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Endpoint demo

| Method | Path | Menunjukkan |
|---|---|---|
| GET | `/api/v1/contoh?nama=jojo&umur=40` | `req.query` — input lewat query string |
| GET | `/api/v1/contoh/:nama/umur/:umur/jk/:jk` | `req.params` — input lewat path |
| POST | `/api/v1/contoh` | `req.body` — input lewat body |
| — | `/api/v1/contohsaya` | router terpisah (`src/routes/`) |

## Catatan versi

- Node 24 LTS
- Express 4 — agar konsisten dengan Minggu 2 dan 3.
- Tanpa database dan tanpa `async/await` database — itu mulai Minggu 3.
