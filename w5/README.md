# SOA Minggu 5 — Form Validation dengan Joi

Starter praktikum Mata Kuliah Arsitektur Berbasis Layanan (SOA)
S1 Sistem Informasi Bisnis — ISTTS

Lanjutan dari Minggu 4: endpoint-nya **tidak berubah**, tapi validasi
manual (`validate()` + `aturanBuku`) diganti schema Joi. Bentuk error tetap
sama — objek per field, isinya array. Ada satu endpoint demo baru:
`POST /api/v1/contoh/validasi`. Kalau ini pertama kalinya kalian
menyiapkan project ini, baca **[PANDUAN.md §1](PANDUAN.md#1-menjalankan-project)**.

## Menjalankan

```bash
npm install
cp .env.example .env        # sesuaikan kredensial MySQL
npm run db:migrate          # buat database soa_minggu5, tabel, data awal
npm run dev
```

Buka http://localhost:3001

## Menguji

Impor `postman/SOA-Minggu5.postman_collection.json` dan
`postman/local.postman_environment.json` ke Postman, pilih environment
`local`, lalu jalankan Runner.

**34 request, 63 assertion, semuanya harus hijau** — 28 request lama
(identik Minggu 2-4) + 6 request baru untuk demo Joi.

```bash
npx newman run postman/SOA-Minggu5.postman_collection.json \
  -e postman/local.postman_environment.json
```

## Daftar endpoint

Endpoint buku sama persis dengan Minggu 4; yang baru ditandai:

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/contoh` | req.query + jebakan tipe string |
| POST | `/api/v1/contoh` | req.body |
| GET | `/api/v1/contoh/array-function` | review map/find/filter/reduce |
| **POST** | **`/api/v1/contoh/validasi`** | **demo Joi — userSchema (Minggu 5)** |
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

Baca **[PANDUAN.md](PANDUAN.md)** — schema Joi, `abortEarly`, pesan
Indonesia via `.label()`/`.messages()`, aturan lintas field
(`Joi.ref`, `.with()`), `stripUnknown`, validasi parsial PATCH, dan
tiga lapis validasi.

Latihan dan tugas yang dikumpulkan ada di **[TUGAS.md](TUGAS.md)**.

## Catatan versi

- Node 24 LTS
- Express 4 — sengaja, agar cocok dengan materi referensi.
- Sequelize 6 di atas `mysql2` — sama seperti Minggu 4.
- **Joi 17** menggantikan `src/utils/validate.js` (file itu dihapus).
  Lapis validasi model dan constraint database TIDAK dihapus —
  lihat PANDUAN §9.
