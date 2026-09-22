# TUGAS PRAKTIKUM MINGGU 4

Mata Kuliah Arsitektur Berbasis Layanan (SOA) · S1 Sistem Informasi Bisnis, ISTTS

Dua bagian: **Latihan** (melatih satu konsep kecil dari bacaan di
[PANDUAN.md](PANDUAN.md)) dan **Tugas** (menguji semuanya sekaligus).
Nomor Latihan 2 dan 8 ditulis jawabannya di `LATIHAN.md`; nomor lainnya
cukup dikerjakan langsung, tidak perlu ditulis ulang.

Sebelum mulai: biarkan log SQL menyala (`src/databases/connection.js`) —
hampir semua latihan minggu ini menonton SQL apa yang Sequelize tulis.

---

## Latihan

### Latihan 1 — Rasakan bug-nya

Lakukan EMPAT hal berikut satu per satu, catat pesan error/perilakunya,
lalu kembalikan semua perubahan:

1. Hapus `as: "karakter"` di `include` pada `getBukuLengkap`
   (`controllers/buku.js`). Panggil `GET /api/v1/buku/1`. Kenapa karakter-nya
   hilang atau error?
2. Di `src/models/index.js`, pindahkan `db.Karakter = ...` ke bawah loop
   `associate`. Restart. Apa pesan errornya? Kaitkan dengan catatan
   "kenapa dua langkah" di file itu.
3. Hapus `Number(bukuId)` di `getSingleBuku`, panggil `GET /api/v1/buku/1`
   dengan MySQL jalan. Apakah 404? Kenapa beda perilakunya dengan
   `Op.eq` string vs number di Minggu 3? (petunjuk: Sequelize mengikat
   parameter; MySQL membandingkan `'1' = 1` dengan konversi. Kesimpulan:
   konversi eksplisit tetap kebiasaan yang benar.)
4. Hapus `attributes: RINGKAS` di `queryBuku`, panggil
   `GET /api/v1/buku?limit=1`, dan lihat JSON-nya lalu lihat log `[SQL]`-nya.
   Kenapa kolom tanggal muncul padahal ada `defaultScope`?

### Latihan 2 — N+1, hitung sendiri

Di `getSingleBuku`, ganti sementara pola `include` dengan pola manual:
ambil buku dengan `findByPk`, lalu loop `Karakter.findAll({ where: { buku_id } })`
untuk setiap hasil (buat endpoint daftar berisi 100 buku dulu dengan cara
memanggil `npm run db:migrate` beberapa kali, atau cukup duplikat seed).
Hitung jumlah baris `[SQL]` yang muncul untuk satu request. Lalu kembalikan
`include` dan hitung lagi.

**Tulis di `LATIHAN.md`:** dua angka itu, dan satu kalimat kapan N+1 muncul.

### Latihan 3 — Urutan route tetap berlaku

ORM tidak mengubah apa pun di lapisan HTTP. Tukar urutan `/statistik` dan
`/:bukuId` di `routes/buku.js`, panggil `GET /api/v1/buku/statistik`,
lihat 404-nya, kembalikan lagi. Satu kalimat: kenapa ORM tidak menyelamatkan
kalian dari bug ini?

### Latihan 4 — Validasi model yang lolos dari controller

Aturan `validate` di `src/models/Buku.js` membatasi tahun terbit 1900–2100,
sedangkan aturan controller membatasi sampai tahun sekarang. Buat sementara
di controller (atau lewat `node -e` dengan require model) sebuah
`Buku.create({ tahun_terbit: 2050, ... })` yang LOLOS validate() manual
(karena 2050 > tahun sekarang... tunggu — sebenarnya gagal di manual; pakai
jalur PATCH langsung instance) dan tangkap
`SequelizeValidationError`-nya. Pastikan hasil akhirnya `400` bukan `500`,
dan pesan yang muncul adalah pesan dari MODEL, bukan dari controller.

### Latihan 5 — Soft delete dan paradoks UNIQUE

1. Di `src/models/Buku.js`, set `paranoid: true`.
2. `DELETE /api/v1/buku/3`, lalu cek phpMyAdmin/SQL: barisnya masih ada,
   `deletedAt` terisi. `GET /api/v1/buku/3` → 404. Kelihatan hilang, padahal ada.
3. `POST` buku dengan judul yang SAMA dengan buku yang barusan
   soft-deleted. Apa yang terjadi? Kenapa?
4. Kembalikan `paranoid: false`.

Pertanyaan untuk dipikirkan (tidak perlu ditulis): kalau bisnis kalian
memang butuh soft delete, desain UNIQUE yang bagaimana yang masuk akal?

### Latihan 6 — Resource `penulis` ke ORM (opsional, tapi disarankan)

Tabel `penulis` sudah ada di `sql/schema.sql` dan `sql/seed.sql`. Bangun:

1. `src/models/Penulis.js` — model dengan satu `validate` dan satu `set`
   karya kalian sendiri.
2. Daftarkan di `src/models/index.js`.
3. `src/controllers/penulis.js` + `src/routes/penulis.js` — GET semua
   (keyword, sort whitelist, limit/offset), GET satu (404), POST (409 judul/
   nama kembar via tiga lapis), PUT, DELETE. Daftarkan routernya di
   `routes/index.js` dan `index.js`.

Ini latihan menyalin POLA, bukan kode: bukti kalian memahami model, bukan
sekadar mengubah contoh.

### Latihan 7 — Menelusuri jalur error

Matikan MySQL sementara, panggil `GET /api/v1/buku`, catat status code dan
pesan. Nyalakan lagi. Jelaskan pada diri sendiri alurnya: dari
`SequelizeConnectionRefusedError` sampai response `503` — sebutkan minimal
tiga komponen (`asyncHandler`, `errorHandler`, dan siapa yang melempar).

### Latihan 8 — Refleksi

Tulis jawabannya di `LATIHAN.md`:

1. Bandingkan `statistikBuku` versi Minggu 3 (SQL manual) dan Minggu 4
   (fn/col/group). Mana yang lebih mudah dibaca? Kapan raw query tetap
   pilihan yang benar?
2. Field `keterangan` (VIRTUAL) sekarang dihitung model. Keuntungan dan
   risikonya apa dibanding menghitungnya di controller?
3. Kalau Minggu 5 mengganti `validate()` manual dengan Joi, lapis validasi
   mana yang TIDAK boleh dihapus? Kenapa?
4. Satu hal dari starter minggu ini yang menurut kalian berlebihan — dan
   alasannya. (Jawaban jujur bernilai lebih dari jawaban sopan.)

---

## Tugas yang dikumpulkan

**ORM-kan studi kasus Minggu 3.** Backend rental kendaraan (CV Wira Jaya
Rental) yang kalian bangun dengan SQL manual minggu lalu sekarang pindah ke
Sequelize — endpoint, aturan bisnis, dan bentuk response TIDAK berubah;
lapisan implementasinya yang diganti.

Persyaratan:

- [ ] Tiga model: Kendaraan, Pelanggan, Transaksi — masing-masing dengan
      minimal satu `validate` dan satu `set`/`get`.
- [ ] Relasi yang benar: satu pelanggan punya banyak transaksi, satu
      kendaraan punya banyak transaksi (hasMany / belongsTo, dinyatakan
      di kedua sisi).
- [ ] Semua aturan bisnis Minggu 3 tetap teruji lewat Postman tanpa
      perubahan request — termasuk "kendaraan sedang disewa tidak bisa
      double booking" dan "plat nomor tidak boleh kembar"
      (mana yang kalian jaga di controller, mana di `unique: true`?
      Tulis keputusannya).
- [ ] Koleksi Postman kalian dari Minggu 3 dijalankan kembali — semua
      hijau tanpa diedit. Itulah bukti antarmuka kalian stabil.
- [ ] Transaksi pendaftaran/pengubahan yang menyentuh dua tabel
      (misal: membuat transaksi sewa sekaligus mengubah status kendaraan)
      memakai `sequelize.transaction()` — atau kalian jelaskan kenapa
      TIDAK perlu untuk kasus kalian.
- [ ] README: satu tabel "dulu (SQL manual) → sekarang (ORM)" untuk
      minimal tiga operasi, plus satu kasus di mana kalian tetap memakai
      raw query dan alasannya.

Kriteria penilaian:

| Kriteria | Bobot | Nilai penuh berarti |
|---|---|---|
| Model & relasi | 30% | Tipe, validate, set/get, dan relasi dua arah benar |
| Aturan bisnis tetap berlaku | 30% | Semua test Postman Minggu 3 hijau tanpa diubah |
| Pemahaman lapisan | 20% | Tiga lapis validasi dipahami; whitelist sort tetap ada |
| Transaksi | 10% | Dipakai dengan alasan, atau dikesampingkan dengan alasan |
| Refleksi | 10% | Honest comparison, bukan copy-paste materi |
