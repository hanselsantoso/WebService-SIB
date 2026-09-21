# TUGAS MINGGU 2 — Praktikum 1 — REST Service Dasar dengan Express

*Arsitektur Berbasis Layanan*

| Minggu | Di kelas | Di rumah | Tugas | Estimasi |
|---|---|---|---|---|
| Minggu 2 | Tugas 1–4 | Tugas 5–7 | Individual | ± 3 jam |

Ong, Hansel Santoso, S.Si., M.Kom.

S1 Sistem Informasi Bisnis · ISTTS

| Kumpulkan | Nama repo | Tenggat | Kanal |
|---|---|---|---|
| Tautan repo GitHub | `soa-prak1-<NRP>` | `[ISI: tgl & jam]` | `[ISI: LMS]` |

## Persiapan

Jalankan starter project. Pastikan koleksi Postman bawaan **hijau semua (28 request)** sebelum mulai.

```bash
npm install
cp .env.example .env
npm run dev
```

Semua penjelasan konsep ada di `PANDUAN.md` dalam starter project.

## Soal

### Tugas 1 — Filter lanjutan  ·  20 menit

Tambahkan lima parameter ke `GET /api/v1/buku`, semuanya harus bisa digabung:

| Parameter | Fungsi |
|---|---|
| `harga_min`, `harga_max` | Rentang harga |
| `tersedia=true` | Hanya yang `stok > 0` |
| `tahun_min`, `tahun_max` | Rentang tahun terbit |

Syarat: **jangan ubah berkas `src/routes/buku.js`.**

### Tugas 2 — Endpoint agregat  ·  20 menit

| Endpoint | Mengembalikan | Bila kosong |
|---|---|---|
| `GET /api/v1/buku/termurah` | Buku dengan harga terendah | `404` |
| `GET /api/v1/buku/kategori/:nama` | Semua buku di kategori itu | `404` |

Perhatikan urutan route: yang berteks tetap harus di atas `/:bukuId`.

### Tugas 3 — Aturan bisnis  ·  25 menit

| Aturan | Status |
|---|---|
| Buku dengan `stok > 0` tidak boleh dihapus | `409` |
| `harga` tidak boleh berubah lebih dari 50% dalam satu PATCH | `400` |
| `tahun_terbit` diabaikan bila dikirim lewat PATCH | `200` |

### Tugas 4 — Karakter bisa ditulis  ·  30 menit

```text
POST   /api/v1/buku/:bukuId/karakter
PUT    /api/v1/buku/:bukuId/karakter/:karakterId
DELETE /api/v1/buku/:bukuId/karakter/:karakterId
```

- Validasi `nama` (wajib, 2–100 karakter) dan `peran` (`protagonis` / `antagonis` / `pendukung`).
- Id karakter unik di dalam bukunya, bukan global.
- Bedakan pesan `404` buku tidak ada dan `404` karakter tidak ada.
- POST mengembalikan `201` + header `Location`.
- Pasang `.all(methodNotAllowed(...))`.

### Tugas 5 — Resource penulis dari nol  ·  45 menit

Data awal sudah ada di `src/data/penulis.js`. Buat sendiri controller dan routes-nya.

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/penulis` | `keyword`, `negara`, `limit`, `offset` |
| GET | `/api/v1/penulis/:id` | `404` bila tidak ada |
| GET | `/api/v1/penulis/:id/buku` | Semua buku karya penulis ini |
| POST | `/api/v1/penulis` | Validasi + tolak nama duplikat |
| PUT | `/api/v1/penulis/:id` | Semua field wajib |
| PATCH | `/api/v1/penulis/:id` | Hanya field yang dikirim |
| DELETE | `/api/v1/penulis/:id` | **`409`** bila masih punya buku |

Validasi: `nama` (3–100 karakter), `negara` (wajib), `tahun_lahir` (1800–tahun ini).

### Tugas 6 — Koleksi Postman  ·  25 menit

Tambahkan folder `Penulis`, **minimal 10 request**, semuanya bertest. Wajib mencakup:

- `400` — dan test memeriksa lebih dari satu field dilaporkan sekaligus.
- `404`, `405` (beserta header `Allow`), dan `409`.
- Satu test yang membuktikan field asing seperti `isAdmin` tidak ikut tersimpan.
- Rantai variabel: POST menyimpan `{{penulisId}}` untuk dipakai request berikutnya.
- Semua request memakai `{{baseUrl}}`.

### Tugas 7 — README  ·  15 menit

- Cara menjalankan project.
- Tabel seluruh endpoint: method, path, keterangan.
- Tiga keputusan yang kalian ambil sendiri beserta alasannya.
- Satu paragraf: kalau data pindah ke MySQL minggu depan, berkas mana yang berubah dan mana yang tidak.

## Yang dikumpulkan

- [ ] Tugas 1–7 selesai.
- [ ] Koleksi + environment Postman di-export ke folder `postman/` dan ter-commit.
- [ ] Total koleksi ≥ 35 request, seluruhnya hijau di Runner.
- [ ] `.gitignore` berisi `node_modules/` dan `.env`.
- [ ] `node_modules/` tidak ter-commit — cek dengan `git ls-files | grep node_modules`.
- [ ] Struktur `routes` / `controllers` / `data` / `middlewares` / `utils` dipertahankan.

## Penilaian

| Kriteria | Bobot | Nilai penuh |
|---|---|---|
| Endpoint berfungsi | 25% | Semua method jalan pada dua resource, termasuk nested dan relasi |
| Status code | 20% | `201`+`Location`, `404` vs `405` dibedakan, `409` tepat sasaran |
| Struktur project | 20% | Routes dan controllers terpisah; tidak ada logika di berkas routes |
| Validasi | 20% | Semua error dilaporkan sekaligus per field; field asing tertahan |
| Koleksi Postman | 15% | ≥ 35 request bertest, mencakup jalur gagal, hijau semua |

### Pengurang nilai

- `http://localhost:3001` ditulis langsung di request Postman.
- `node_modules/` ter-commit.
- Mengembalikan `200` untuk kondisi error.
- Ada logika bisnis (`if`, `.filter()`) di dalam berkas `routes/`.
- Menyimpan `req.body` langsung tanpa disaring.
- Route berparameter didaftarkan di atas route berteks tetap.

Keterlambatan: `[ISI: kebijakan]`.  Alat bantu AI: `[ISI: kebijakan]`.  Konsultasi: `[ISI: jadwal]`.
