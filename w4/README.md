# SOA Minggu 4 — ORM Sequelize

Starter praktikum Mata Kuliah Arsitektur Berbasis Layanan (SOA)
S1 Sistem Informasi Bisnis — ISTTS

Lanjutan dari Minggu 3: endpoint-nya **tidak berubah**, tapi lapisan data
SQL manual diganti Sequelize. Response tetap sama seperti Minggu 2-3 —
plus satu field virtual `keterangan` yang dihitung model. Kalau ini
pertama kalinya kalian menyiapkan project ini, baca
**[PANDUAN.md §1](PANDUAN.md#1-menjalankan-project)**.

## Menjalankan

```bash
npm install
cp .env.example .env        # sesuaikan kredensial MySQL
npm run db:migrate          # buat database soa_minggu4, tabel, data awal
npm run dev
```

Buka http://localhost:3001 — dan lihat log `[SQL]` di terminal: itulah SQL
yang Sequelize tulis untuk kalian.

## Menguji

Impor `postman/SOA-Minggu4.postman_collection.json` dan
`postman/local.postman_environment.json` ke Postman, pilih environment
`local`, lalu jalankan Runner.

**28 request, 49 assertion, semuanya harus hijau** — request-nya identik
dengan Minggu 2.

```bash
npx newman run postman/SOA-Minggu4.postman_collection.json \
  -e postman/local.postman_environment.json
```

## Daftar endpoint

Sama persis dengan Minggu 3:

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/contoh` | req.query + jebakan tipe string |
| POST | `/api/v1/contoh` | req.body |
| GET | `/api/v1/contoh/array-function` | review map/find/filter/reduce |
| GET | `/api/v1/contoh/:nama/umur/:umur/jk/:jk?` | req.params, parameter opsional |
| PUT, POST | `/api/v1/contoh/gabungan/:id` | ketiga sumber input sekaligus |
| GET | `/api/v1/buku` | keyword, kategori, sort, order, limit, offset |
| POST | `/api/v1/buku` | 201 + header Location |
| GET | `/api/v1/buku/statistik` | agregat — perhatikan urutan route |
| GET | `/api/v1/buku/:bukuId` | 404 kalau tidak ada |
| PUT | `/api/v1/buku/:bukuId` | ganti seluruhnya |
| PATCH | `/api/v1/buku/:bukuId` | ubah sebagian |
| DELETE | `/api/v1/buku/:bukuId` | hapus |
| GET | `/api/v1/buku/:bukuId/karakter/:karakterId?` | nested resource |

Method lain pada path di atas menghasilkan **405** beserta header `Allow`.

## Panduan lengkap

Baca **[PANDUAN.md](PANDUAN.md)** — definisi model, relasi & eager loading,
N+1, dua-lapis-tiga validasi, kapan raw query masih diperlukan, dan
troubleshooting Sequelize.

Latihan dan tugas yang dikumpulkan ada di **[TUGAS.md](TUGAS.md)**.

## Catatan versi

- Node 24 LTS
- Express 4 — sengaja, agar cocok dengan materi referensi.
- **Sequelize 6** di atas `mysql2`. Pemetaan skema manual, TANPA
  auto-sync/migration — tabel dibuat `sql/schema.sql` yang sama seperti
  Minggu 3 (ditambah kolom timestamps). Migration tool resmi datang
  Minggu 9. Endpoint tidak akan berubah.
