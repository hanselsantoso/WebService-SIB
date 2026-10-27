# SOA Minggu 8 — API Key, Metering & Rate Limit

Starter praktikum Mata Kuliah Arsitektur Berbasis Layanan (SOA)
S1 Sistem Informasi Bisnis — ISTTS

Project semester berlanjut dari W7. Minggu ini membedakan identitas
aplikasi (API key) dari identitas pengguna (JWT), mencatat request, dan
menerapkan kuota tier. **Tidak ada tugas atau project terpisah.**

## Menjalankan

```bash
npm install
cp .env.example .env        # sesuaikan MySQL dan secret JWT W7
npm run db:migrate
npm run dev
```

> `db:migrate` mengisi ulang data demo dan menghapus data latihan lokal.
> Jangan jalankan terhadap database produksi atau data yang perlu dipertahankan.

Untuk sesi berikutnya setelah setup awal: cukup `npm run dev`, lalu buka
Postman dan pilih environment `local`. Starter W8 menggunakan port **3002**;
base URL Postman sudah disetel ke `http://localhost:3002/api/v1`.

## Menguji

Impor `postman/SOA-Minggu8.postman_collection.json` dan
`postman/local.postman_environment.json`. Jalankan koleksi **dari awal**:
Register membuat API key dan collection test menyimpannya sementara.

```bash
npx newman run postman/SOA-Minggu8.postman_collection.json \
  -e postman/local.postman_environment.json
```

Koleksi memiliki 63 request dan mencakup rate limit basic: lima request
diterima per 10 detik, request berikutnya ditolak dengan 429 dan
`Retry-After`.

## Endpoint baru

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/usage/me` | tier dan pemakaian API key sendiri; tidak dimeter |
| GET | `/api/v1/usage/buku` | daftar buku billable; perlu `x-api-key`, kena rate limit |

API key didapat dari response registrasi Minggu 7. Header:
`x-api-key: <key>`. Endpoint lama tidak berubah; route yang memakai API key
ditambahkan terpisah agar koleksi lama tetap kompatibel.

## Materi

Baca **[PANDUAN.md](PANDUAN.md)** untuk JWT vs API key, middleware,
metering, tier, billing policy, payment model, dan batas implementasi demo.
