# PANDUAN PRAKTIKUM MINGGU 8

## API Key, Metering & Rate Limit

Mata Kuliah Arsitektur Berbasis Layanan (SOA) · S1 Sistem Informasi Bisnis, ISTTS

---

Project semester tetap berlanjut. Minggu 7 menjawab **siapa pengguna yang
login** lewat JWT; minggu ini menambahkan **aplikasi/developer mana yang
memanggil API**, berapa request yang dipakai, dan kapan kuota habis.
Endpoint lama tidak diubah. Dua route baru di `/api/v1/usage` memakai API
key dan metering.

## Daftar Isi

1. [Menjalankan project](#1-menjalankan-project)
2. [JWT vs API key](#2-jwt-vs-api-key)
3. [API key: identitas aplikasi](#3-api-key-identitas-aplikasi)
4. [Metering: catat pemakaian](#4-metering-catat-pemakaian)
5. [Tier dan rate limit](#5-tier-dan-rate-limit)
6. [Urutan middleware](#6-urutan-middleware)
7. [Billing policy dan batas demo](#7-billing-policy-dan-batas-demo)
8. [Payment model sebagai keputusan produk](#8-payment-model-sebagai-keputusan-produk)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Menjalankan project

Prasyarat: Node 24, MySQL menyala, dan secret JWT dari Minggu 7 tersedia.

```bash
npm install
cp .env.example .env        # isi kredensial MySQL + dua secret JWT
npm run db:migrate
npm run dev                 # http://localhost:3001
```

> **Peringatan data lokal:** `npm run db:migrate` menjalankan `seed.sql`
> yang me-reset data demo (`buku`, `karakter`, `penulis`, `pengguna`, dan
> log API). Pakai hanya pada database praktikum lokal, bukan database
> produksi atau data yang ingin disimpan.

Impor `postman/SOA-Minggu8.postman_collection.json` dan
`postman/local.postman_environment.json`. Jalankan koleksi **dari awal**:
request register membuat API key dan menyimpannya sementara untuk folder
metrik. Koleksi berisi 63 request; 99 assertion.

```bash
npx newman run postman/SOA-Minggu8.postman_collection.json \
  -e postman/local.postman_environment.json
```

Database baru berisi tier `basic` (5 request / 10 detik) dan `premium`
(20 request / 10 detik). Request berbayar contoh:

```http
GET /api/v1/usage/buku
x-api-key: <api_key hasil register>
```

`GET /api/v1/usage/me` menunjukkan tier dan pemakaian key tersebut. Route
usage ini membutuhkan key tetapi sengaja tidak menambah metering.

## 2. JWT vs API key

Keduanya token, tetapi menjawab pertanyaan berbeda:

| | JWT — Minggu 7 | API key — Minggu 8 |
|---|---|---|
| Mengidentifikasi | Pengguna yang login | Aplikasi/developer pemanggil |
| Umur | Pendek; access token 30 detik di demo | Biasanya lebih panjang |
| Dibuat saat | Login | Registrasi developer |
| Dikirim sebagai | `Authorization: Bearer <JWT>` | `x-api-key: <key>` |
| Fungsi utama | Autentikasi + otorisasi pengguna | Identifikasi aplikasi, metering, kuota |

Jangan mencampur keduanya pada satu middleware: satu key mewakili aplikasi,
satu JWT mewakili pengguna. Project nyata dapat memerlukan keduanya di
route berbeda.

## 3. API key: identitas aplikasi

`POST /api/v1/auth/register` dari Minggu 7 sudah membuat API key acak dengan
`crypto.randomUUID()` dan mengembalikannya satu kali di response. Minggu ini
key itu dipakai melalui header `x-api-key`.

`checkApiKey` melakukan tiga hal:

1. Header tidak ada → `401`.
2. Key tidak dikenal → `401`.
3. Key valid → pemilik ditempel ke `req.pengguna`, lalu `next()`.

API key adalah kredensial: simpan seperti password, jangan taruh di URL,
log, screenshot publik, atau repository. Di client sebenarnya gunakan
secret store; Postman collection ini hanya menyimpan key sementara di
collection variable saat run.

## 4. Metering: catat pemakaian

Setiap request yang lolos API-key check dan rate limit dicatat ke tabel
`api_log`:

| Kolom | Isi |
|---|---|
| `pengguna_id` | pemilik key |
| `endpoint` | URL/path yang diminta |
| `method` | HTTP method |
| `createdAt` | waktu request diterima |

Log ini menjadi sumber hitung kuota. Starter memilih billing policy yang
jelas: **request diterima setelah rate-limit check dihitung, termasuk jika
controller kemudian menjawab 404/500.** Key salah dan request yang ditolak
dengan 429 tidak dicatat. `GET /usage/me` dikecualikan agar membaca meter
tidak menambah meter itu sendiri.

Jangan menyimpan nilai API key di `api_log`; catat ID pengguna saja. Itu
membatasi paparan jika tabel log dibaca pihak yang tidak berhak.

## 5. Tier dan rate limit

Tier disimpan di tabel `api_tierlist`:

| Tier | Kuota starter | Jendela |
|---|---:|---:|
| `basic` | 5 request | 10 detik |
| `premium` | 20 request | 10 detik |

Saat batas tercapai, endpoint mengembalikan `429 Too Many Requests`, body
berisi informasi tier/kuota, dan header `Retry-After` memberi tahu client
kapan boleh mencoba lagi. Response yang diterima juga menyertakan:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Window`

Untuk melihat tier berbeda saat demo lokal, ubah akun yang sudah register:

```sql
UPDATE pengguna SET api_level = 'premium' WHERE pengguna_nama = 'nama_akun';
```

Jalankan lagi request billable. Kuota premium lebih besar; batasnya tetap
ada. Seeder sengaja tidak membuat akun premium otomatis.

## 6. Urutan middleware

Route billable memakai urutan ini:

```js
checkApiKey -> rateLimitApi -> logApi -> controller
```

1. **`checkApiKey`** mengidentifikasi aplikasi; middleware berikutnya perlu
   `req.pengguna`.
2. **`rateLimitApi`** menghitung pemakaian dan menolak lebih awal.
3. **`logApi`** mencatat hanya request yang lolos kuota.
4. **Controller** mengerjakan operasi API.

Urutan terbalik dapat mencatat request yang ditolak, menghabiskan kuota
sebelum validasi key, atau menjalankan controller tanpa identitas pemilik.

## 7. Billing policy dan batas demo

Meter di starter menggunakan query count dalam jendela waktu 10 detik —
cukup untuk memahami konsep, bukan limiter produksi. Dua request serentak
dapat membaca count yang sama sebelum salah satunya menulis log; produksi
memerlukan operasi atomik (mis. Redis/increment dengan expiry atau
transaction/locking yang tepat). Log database juga terus tumbuh dan perlu
retensi/arsip.

Aturan billing adalah keputusan produk, bukan kebenaran universal. API
komersial perlu menyatakan apakah error, retry, dan endpoint usage ditagih.
Starter menyatakan kebijakan di bagian 4 agar perilakunya bisa diuji dan
dipahami.

## 8. Payment model sebagai keputusan produk

Metering memberi data konsumsi; payment model menentukan cara konsumsi itu
ditagih:

| Model | Cara kerja | Cocok saat |
|---|---|---|
| Pay per use | bayar setiap request | tiap panggilan punya nilai langsung |
| Subscription | biaya bulanan + kuota | penggunaan stabil |
| Freemium | tier dasar gratis, tier lebih besar berbayar | developer perlu mencoba dahulu |
| Tiered | harga/kuota berbeda tiap tier | pelanggan punya skala berbeda |

Di project semester, terangkan siapa konsumennya, apa yang dihitung, dan
apa respons ketika kuota habis. Minggu ini tidak membuat tugas/proposal
mingguan baru; keputusan produk tetap bagian dari pengembangan project
semester yang sama.

## 9. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| `req.headers['x-api-key']` kosong | header tidak dikirim atau salah nama | kirim `x-api-key`, bukan `apiKey` |
| API key invalid | key bukan milik akun di database ini | register akun pada database lokal yang sedang dipakai |
| Rate limit tidak pernah kena | request terlalu lambat atau akun tier premium | gunakan rangkaian request Postman; cek `api_level` |
| Langsung kena 429 | key sudah punya log dalam 10 detik terakhir | tunggu jendela habis atau reset database lokal |
| `Retry-After` hilang | limiter menolak sebelum menghitung waktu | cek `rateLimitApi` dan log request tertua |
| Request 429 tetap menambah usage | `logApi` dipasang sebelum limiter | urutan harus `checkApiKey -> rateLimitApi -> logApi` |
| Usage endpoint menaikkan usage sendiri | metering dipasang pada `/usage/me` | endpoint introspeksi hanya memeriksa API key |
