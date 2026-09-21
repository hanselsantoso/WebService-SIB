# TUGAS PRAKTIKUM MINGGU 3

Mata Kuliah Arsitektur Berbasis Layanan (SOA) · S1 Sistem Informasi Bisnis, ISTTS

Dua bagian: **Latihan** (melatih satu konsep kecil dari bacaan di
[PANDUAN.md](PANDUAN.md)) dan **Tugas** (menguji semuanya sekaligus lewat
studi kasus baru). Nomor Latihan 1, 4, dan 8 ditulis jawabannya di
`LATIHAN.md`; nomor lainnya cukup dikerjakan langsung, tidak perlu ditulis ulang.

---

## Latihan

### Latihan 1 — Rasakan bug-nya

Lakukan EMPAT hal berikut satu per satu, catat pesan error/perilaku yang
muncul dan penyebabnya di tabel `LATIHAN.md`:

1. Tukar urutan `/statistik` dan `/:bukuId` di `routes/buku.js`, panggil `GET /api/v1/buku/statistik`.
2. Hapus `Number()` pada `c.id === Number(karakterId)` di `getKarakter` (`controllers/buku.js`), panggil `GET /api/v1/buku/1/karakter/2`.
3. Nonaktifkan `app.use(express.json())` di `index.js`, kirim `POST /api/v1/buku` dengan body JSON.
4. Hapus pembungkus `asyncHandler(...)` dari salah satu route `buku`, matikan MySQL, lalu panggil route itu.

Kembalikan semua perubahan setelah selesai mencatat.

### Latihan 2 — 404 vs 405

Panggil `DELETE /api/v1/buku` lewat `curl -i` (bukan lewat Postman, supaya
kalian melihat header mentahnya). Temukan header `Allow`-nya. Jelaskan pada
diri sendiri kenapa ini bukan `404`.

### Latihan 3 — Urutan route

Ikuti instruksi "coba sendiri" di [PANDUAN §6](PANDUAN.md#6-urutan-route-menentukan-segalanya)
sampai selesai — tukar urutan, lihat 404-nya, kembalikan lagi.

### Latihan 4 — Kenapa 409 dan bukan 400?

Tulis jawabannya di `LATIHAN.md`. Kaitkan dengan `UNIQUE KEY` di
`sql/schema.sql` — apa yang terjadi kalau constraint itu dihapus dan dua
request `POST` dengan judul sama datang nyaris bersamaan? (lihat
[PANDUAN §15](PANDUAN.md#15-dua-lapis-validasi))

### Latihan 5 — Normalisasi dan CASCADE

Hapus sebuah buku yang punya karakter (misalnya id `1`) lewat
`DELETE /api/v1/buku/1`, lalu jalankan
`SELECT * FROM karakter WHERE buku_id = 1` langsung di MySQL. Jelaskan pada
diri sendiri kenapa hasilnya kosong padahal tidak ada satu baris kode pun di
`controllers/buku.js` yang menghapus tabel `karakter`. Jalankan
`npm run db:migrate` sesudahnya untuk mengembalikan data.

### Latihan 6 — Migrasi resource `penulis` ke MySQL, + aturan bisnis tambahan (opsional)

`src/data/penulis.js` sudah disiapkan mengikuti pola yang sama dengan
`src/data/buku.js`, dan tabel `penulis` sudah ada isinya (lihat
`sql/schema.sql` dan `sql/seed.sql`). Bangun `src/controllers/penulis.js`
dan `src/routes/penulis.js` sendiri, mengikuti pola `buku`: `GET` semua,
`GET` satu (404 kalau tidak ada), `POST`, `PUT`, `DELETE`. Daftarkan
router barunya di `src/routes/index.js` dan `index.js`.

Latihan tambahan opsional (tidak dinilai terpisah, tapi menjawab Latihan 8
no. 2 di bawah): terapkan aturan "tidak boleh hapus buku yang masih
berstok" pada `deleteBuku` (`src/controllers/buku.js`) — kalau `stok > 0`,
kembalikan `409` dan JANGAN hapus. Pola persis sama dengan aturan judul
kembar di [PANDUAN §15](PANDUAN.md#15-dua-lapis-validasi): cek dulu sebelum eksekusi.

### Latihan 7 — Menelusuri jalur error

Matikan MySQL sementara, panggil `GET /api/v1/buku`, catat status code dan
pesannya. Nyalakan lagi MySQL. Jelaskan pada diri sendiri alur request itu:
file mana yang dilewati dari `pool.query()` gagal sampai menjadi response
`503` (sebutkan minimal tiga file/komponen: repository, `asyncHandler`,
`errorHandler`).

### Latihan 8 — Refleksi

Tulis jawabannya di `LATIHAN.md`:

1. Kenapa `?keyword=zzz` 200 tapi `/buku/999` 404?
2. Kenapa hapus buku berstok itu 409?
   > Kerjakan dulu bagian opsional di Latihan 6 di atas, baru jawab
   > pertanyaan ini dari kode yang baru saja kalian tulis sendiri.
3. Kalau pindah ke MySQL, file mana yang berubah?
4. Apa yang berlebihan dari project ini?

---

## Tugas yang dikumpulkan

Tugas minggu ini bentuknya studi kasus: sebuah "klien" (CV Wira Jaya
Rental) meminta backend REST API baru untuk bisnis rental kendaraan
mereka — resource dan aturan bisnis yang SAMA SEKALI BEDA dari `buku`,
supaya kalian membuktikan paham POLA-nya, bukan cuma hafal kode `buku`.

Soal lengkapnya (latar belakang klien, aturan bisnis, kontrak endpoint,
deliverables, kriteria penilaian) ada di file terpisah:

**→ [`TUGAS-RENTAL.md`](TUGAS-RENTAL.md)**

Semua konsep yang dibutuhkan untuk mengerjakannya sudah ada di
[PANDUAN.md §1–§18](PANDUAN.md): repository pattern, prepared statement,
dua lapis validasi (untuk aturan "plat nomor tidak boleh kembar", dst),
`asyncHandler`, dan pola "tolak dengan 409 sebelum eksekusi" yang sudah
kalian latih di Latihan 6.
