# TUGAS PRAKTIKUM MINGGU 5

Mata Kuliah Arsitektur Berbasis Layanan (SOA) · S1 Sistem Informasi Bisnis, ISTTS

Dua bagian: **Latihan** (melatih satu konsep kecil dari bacaan di
[PANDUAN.md](PANDUAN.md)) dan **Tugas** (menguji semuanya sekaligus).
Nomor Latihan 2, 4, dan 8 ditulis jawabannya di `LATIHAN.md`; nomor
lainnya cukup dikerjakan langsung, tidak perlu ditulis ulang.

---

## Latihan

### Latihan 1 — Rasakan bug-nya

Lakukan EMPAT hal berikut satu per satu, catat perilakunya, lalu kembalikan
semua perubahan:

1. Hapus `abortEarly: false` dari `validasiJoi()`
   (`src/utils/validation/validateJoi.js`). Kirim payload yang salah di
   TIGA field. Berapa field yang dilaporkan?
2. Hapus `stripUnknown: true` dari opsi. Kirim `POST /api/v1/buku` dengan
   `isAdmin: true`. Apa yang terjadi pada `value` — dan kenapa test
   "Mass assignment ditolak" mungkin masih hijau padahal pertahanan sudah
   bocor? (petunjuk: siapa lagi yang menyaring? apakah itu jaminan?)
3. Di `bukuSchema`, ganti kode `"string.min"` menjadi `"string.minimum"`
   di `.messages()` judul. Kirim judul pendek. Pesan mana yang muncul?
   Petunjuk menemukan kode yang benar ada di PANDUAN §5.
4. Hapus satu backslash dari pattern password di `userSchema`
   (`\\d` → `\d`). Kirim password `Kujo1234!` yang seharusnya valid.
   Apa yang terjadi — dan kenapa TIDAK ada pesan error yang membantu?

### Latihan 2 — Menemukan kode error

`console.log` `error.details[0].type` untuk payload yang salah di
`validasiUser` (`controllers/contoh.js`), jalankan sekali, catat LIMA kode
berbeda yang muncul untuk LIMA aturan berbeda. **Tulis di `LATIHAN.md`:**
tabel aturan → kode → pesan kalian. Kembalikan kodenya.

### Latihan 3 — PATCH vs default

Di `validasiParsial()`, hapus sementara filter `valueBersih`. Kirim
`PATCH /api/v1/buku/1` dengan `{"harga": 175000}` (tanpa `stok`), lalu
`GET /api/v1/buku/1`. Apa yang terjadi pada stok? Kembalikan filternya.
Satu kalimat: kenapa `.default()` berbahaya pada validasi parsial?

### Latihan 4 — Dua lapis Joi vs model

Kirim `POST /api/v1/buku` dengan `tahun_terbit: 2050`. Lapis mana yang
menolak — Joi atau model? Kenapa angkanya berbeda
(controller/schema: tahun sekarang; model: 2100)?
Kemudian lewat `node -e` dengan require model, panggil
`Buku.create({ judul: 'Cek Model', penulis: 'A B C', tahun_terbit: 2050, harga: 1, kategori: 'novel' })`
dan amati `SequelizeValidationError`-nya.
**Tulis di `LATIHAN.md`:** siapa menolak apa, dan kenapa keduanya perlu.

### Latihan 5 — Aturan lintas field buatan kalian

Tambahkan ke `userSchema`: field `rekening` dan `bank` dengan aturan
"kalau `rekening` dikirim, `bank` wajib ikut" — plus pesan Indonesia dan
label. Buktikan lewat Postman (request baru, dua-duanya: valid dan gagal).

### Latihan 6 — Schema `penulis` (opsional, tapi disarankan)

Di Minggu 4 Latihan 6 kalian membangun resource `penulis` (kalau belum,
bangun dulu model + endpoint-nya). Sekarang ganti validasinya dengan
`penulisSchema` di `src/utils/validation/`: `nama` (3–100, wajib),
`negara` (wajib), `tahun_lahir` (1800–tahun sekarang), plus pesan
Indonesia. Semua test Postman penulis harus tetap hijau tanpa diubah.

### Latihan 7 — Menelusuri tiga pintu 400/409

Tiga request yang menghasilkan error, tiga pintu berbeda. Jalankan,
lalu jelaskan pada diri sendiri jalurnya (file mana yang melempar, siapa
yang menangkap):

1. `POST /api/v1/buku` dengan `tahun_terbit: 1800` → 400 dari JOI
2. `PATCH /api/v1/buku/1` langsung lewat `buku.update()` dengan tahun
   3000 (lewati Joi — tulis sementara di controller) → 400 dari MODEL
3. `POST /api/v1/buku` dengan judul yang sama dua kali nyaris bersamaan
   (Runner, 2 iterasi, delay 0) → 409 dari... siapa?

### Latihan 8 — Refleksi

Tulis jawabannya di `LATIHAN.md`:

1. Validasi manual Minggu 2-4 kini diganti Joi. Menurut kalian, bagian
   mana dari `validate.js` yang paling menyulitkan — dan di Joi jadi
   sepele? (buka `git show w4:src/utils/validate.js` kalau perlu)
2. `.default(0)` pada stok sekarang ada di TIGA tempat: Joi, model,
   database (DEFAULT 0). Apakah itu redundansi buruk atau jaring yang
   benar? Kenapa?
3. Kapan aturan bisnis TIDAK boleh masuk schema Joi? Beri satu contoh
   dari project ini. (petunjuk: judul kembar)
4. Satu hal dari Joi yang menurut kalian BERLEBIHAN untuk project
   sekecil ini — dan alasannya. (Jawaban jujur bernilai lebih dari
   jawaban sopan.)

---

## Tugas yang dikumpulkan

**Joi-kan studi kasus rental.** Backend rental kendaraan (studi kasus
Minggu 3-4, CV Wira Jaya Rental) sekarang mendapat lapis validasi Joi —
endpoint dan bentuk error TIDAK berubah; lapisan pertamanya yang diganti.

Persyaratan:

- [ ] Tiga schema di `src/utils/validation/`: `kendaraanSchema`,
      `pelangganSchema`, `transaksiSchema` — masing-masing dengan pesan
      Indonesia + `.label()` di SEMUA field.
- [ ] Semua aturan bentuk dari Minggu 3 pindah ke Joi: nomor plat wajib,
      tarif per hari angka non-negatif, nama pelanggan 3–100, dst —
      sesuai keputusan desain kalian sendiri di Minggu 3.
- [ ] Minimal SATU aturan lintas field per schema:
      - `transaksiSchema`: `rencana_kembali` harus SETELAH `mulai` —
        gunakan `Joi.ref("mulai")` dengan `Joi.date().greater(...)`.
      - `kendaraanSchema`: `status: "diservis"` wajib disertai `catatan_servis`
        — gunakan `.with()` atau `.when()`.
- [ ] `PATCH` di semua resource memakai validasi parsial
      (`validasiParsial`) — field yang tidak dikirim tidak boleh
      terisi default diam-diam.
- [ ] Koleksi Postman Minggu 3/4 dijalankan kembali — semua hijau tanpa
      diedit. Tambahkan minimal 6 request validasi baru (per schema:
      satu valid, satu multi-error, satu lintas-field) dengan test
      `400` + cek keys errors.
- [ ] `node_modules/` dan `.env` tetap tidak masuk git; error Joi tidak
      pernah menggantikan `409` unique (itu lapis lain).

Kriteria penilaian:

| Kriteria | Bobot | Nilai penuh berarti |
|---|---|---|
| Schema lengkap | 30% | Tiga schema, semua field berlabel, semua pesan Indonesia |
| Semua error sekaligus | 20% | Multi-error dilaporkan per field (test Postman membuktikan) |
| Aturan lintas field | 20% | `Joi.ref` dan `.with()`/`.when()` dipakai dengan benar |
| PATCH parsial | 15% | Default tidak menyelinap; field asing ditolak/dibuang |
| Antarmuka stabil | 15% | Koleksi lama hijau tanpa diedit; request validasi baru bertest |
