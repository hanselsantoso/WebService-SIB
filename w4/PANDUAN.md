# PANDUAN PRAKTIKUM MINGGU 4

## ORM — Model & Relasi dengan Sequelize

Mata Kuliah Arsitektur Berbasis Layanan (SOA) · S1 Sistem Informasi Bisnis, ISTTS

---

Minggu 3 kalian menulis SQL dengan tangan. Minggu ini ORM yang menulis SQL
untuk kalian. Keduanya sah — poinnya bukan mengganti yang lama, tapi tahu
**apa yang kalian dapat dan apa yang kalian serahkan** saat memilih ORM.
Endpoint dan bentuk response TIDAK berubah; kalau koleksi Postman Minggu 2
tetap hijau tanpa diubah, itu bukti ORM mengganti implementasi tanpa
menyentuh antarmuka.

## Daftar Isi

1. [Menjalankan project](#1-menjalankan-project)
2. [Dari SQL manual ke ORM: apa yang berubah](#2-dari-sql-manual-ke-orm-apa-yang-berubah)
3. [Model: peta tabel plus perilaku](#3-model-peta-tabel-plus-perilaku)
4. [Model = repository yang sudah jadi](#4-model--repository-yang-sudah-jadi)
5. [Relasi dan eager loading](#5-relasi-dan-eager-loading)
6. [Dua lapis validasi (sekarang tiga)](#6-dua-lapis-validasi-sekarang-tiga)
7. [Query: where, order, paging](#7-query-where-order-paging)
8. [Kapan raw query masih diperlukan](#8-kapan-raw-query-masih-diperlukan)
9. [Soft delete: paranoid](#9-soft-delete-paranoid)
10. [Troubleshooting Sequelize](#10-troubleshooting-sequelize)

---

## 1. Menjalankan project

Prasyarat sama seperti Minggu 3: Node 24, dan MySQL yang menyala
(Homebrew, XAMPP/Laragon, atau Docker — lihat PANDUAN Minggu 3 §1 bila
perlu ulang).

```bash
npm install
cp .env.example .env        # sesuaikan kredensial MySQL
npm run db:migrate          # buat database soa_minggu4, tabel, data awal
npm run dev                 # http://localhost:3001
```

Kalau log menunjukkan `[DB] Terhubung ke MySQL "soa_minggu4" (via Sequelize)`,
koneksi beres.

**Langkah pertama setelah menyala:** buka terminal tempat server jalan,
lalu buka `http://localhost:3001/api/v1/buku` di browser. Di terminal akan
muncul sesuatu seperti:

```text
[SQL] SELECT `id`, `judul`, `penulis`, `harga`, `stok` FROM `buku` AS `Buku`;
```

Itu Sequelize yang menulis SQL kalian. **Logging ini adalah alat belajar
paling penting minggu ini** — setiap panggilan endpoint, lihat SQL apa yang
sebenarnya dikirim. Setelah selesai belajar, ganti `logging` menjadi `false`
di `src/databases/connection.js`.

## Menguji

Impor `postman/SOA-Minggu4.postman_collection.json` +
`postman/local.postman_environment.json` ke Postman, pilih environment
`local`, jalankan Runner. **28 request, 49 assertion — request-nya identik
dengan Minggu 2, semua harus hijau.**

```bash
npx newman run postman/SOA-Minggu4.postman_collection.json \
  -e postman/local.postman_environment.json
```

## 2. Dari SQL manual ke ORM: apa yang berubah

Bandingkan tiga versi file `controllers/buku.js` (git log):

| Aspek | Minggu 3 (raw) | Minggu 4 (ORM) |
|---|---|---|
| Lapisan data | `src/data/buku.js` berisi SQL manual | `src/models/` — lapisan repo "dibeli tinggal pakai" |
| Baca daftar | `pool.query("SELECT ...")` | `Buku.findAndCountAll({ where, order, limit, offset })` |
| Baca satu + karakter | dua `pool.query()` berurutan | `findByPk(id, { include })` — satu query JOIN |
| Tambah baris | `INSERT INTO ... VALUES (?, ?)` | `Buku.create(value)` |
| Ubah | `UPDATE ... SET ...` manual | `buku.update(value)` pada instance |
| Validasi bentuk | hanya di controller | ditambah validasi di model |
| Kolom sort di ORDER BY | whitelist manual | **whitelist manual — TIDAK hilang!** |

Yang **tidak berubah sama sekali**: URL, method, status code, urutan logika
(404 → validasi → aturan bisnis → simpan), bentuk response, dan pertahanan
mass assignment. Karena itu koleksi Postman tidak perlu diedit.

Sedikit pengecualian yang disengaja: response sekarang memuat field
`keterangan` — lihat bagian 3.

## 3. Model: peta tabel plus perilaku

Buka `src/models/Buku.js`. Satu model mendokumentasikan satu tabel: tipe
kolom, aturan, transformasi, dan relasi — semuanya di SATU tempat.

Fitur yang dipakai starter ini (cari di file, baca komentarnya):

| Fitur | Di Buku.js | Efek |
|---|---|---|
| Tipe DataTypes | `STRING(150)`, `SMALLINT.UNSIGNED`, `ENUM(...)` | cermin `schema.sql` |
| `unique: true` | `judul` | jaring pengaman ketiga untuk judul kembar |
| `set()` | `judul`, `penulis` | trim + rapikan spasi SEBELUM disimpan |
| `validate` | `tahun_terbit`, `harga`, `stok` | ditolak sebelum menyentuh MySQL |
| `defaultValue` | `stok: 0` | versi ORM dari `default: 0` di controller |
| `VIRTUAL` | `keterangan` | dihitung saat dibaca, tidak ada kolomnya |
| `paranoid` | mati di starter | Latihan 5 menyalakannya |
| `defaultScope` | sembunyikan timestamps | response tetap seperti Minggu 2-3 |

Tentang `keterangan` (VIRTUAL): field ini dihitung saat dibaca
(`Buku ini berjudul ..., ditulis ... dan terbit pada tahun ...`) dan muncul
di response, padahal tidak ada kolomnya. Ini satu-satunya perbedaan response
dari Minggu 3 — dan itu pelajarannya: nilai turunan kini dihitung di satu
tempat (model), bukan berulang-ulang di setiap endpoint. Setter-nya sengaja
melempar error: mencoba mengisi `keterangan` dari `req.body` langsung meledak.

Tentang `defaultScope`: Sequelize menyertakan semua kolom by default, dan
`createdAt`/`updatedAt` tidak ada di response Minggu 2-3. Scope menyaringnya
di satu tempat agar koleksi Postman tetap hijau. Latihan menambah model baru
akan membuat kalian menghargai pattern ini.

## 4. Model = repository yang sudah jadi

Di Minggu 3, controller tidak pernah menulis SQL — dia memanggil
`repoBuku.cariId(...)`, `repoBuku.simpan(...)`. Itulah repository pattern.

Minggu ini lapisan itu menghilang **karena sudah dibeli**: `Buku.findByPk()`
adalah `repoBuku.cariId()`, `Buku.create()` adalah `repoBuku.simpan()`.
Model = repository yang ditulis pembuat ORM sekali untuk semua project di
dunia.

Konsekuensi praktisnya di struktur folder: `src/data/` tidak ada lagi di
minggu ini. Ganti nama mental: `src/models/` adalah lapisan data.

## 5. Relasi dan eager loading

Relasi dinyatakan di model, bukan di query:

```js
// src/models/Buku.js
static associate(models) {
  Buku.hasMany(models.Karakter, { foreignKey: "buku_id", as: "karakter" });
}

// src/models/Karakter.js
static associate(models) {
  Karakter.belongsTo(models.Buku, { foreignKey: "buku_id", as: "buku" });
}
```

`as: "karakter"` menentukan nama properti hasil include — dan itu WAJIB
sama dengan bentuk response Minggu 2-3 supaya koleksi tidak berubah.

**Eager loading** — ambil buku beserta karakternya:

```js
Buku.findByPk(id, { include: { model: Karakter, as: "karakter" } });
```

Satu query dengan `LEFT OUTER JOIN`. Lihat log `[SQL]`.

### N+1 — masalah performa paling umum di kode ORM

Hapus `include`, lalu loop: untuk setiap buku panggil
`Karakter.findAll({ where: { buku_id: b.id } })`. 100 buku = **101 round
trip** ke MySQL. Dengan `include`: satu query. Latihan 2 meminta kalian
menghitung sendiri perbedaannya — mahasiswa yang pernah menghitung
query-nya tidak akan pernah lupa.

Kenapa `associate` dijalankan SETELAH semua model dibangun? Baca komentar
di `src/models/index.js` — error klasik `Cannot read property 'Karakter'
of undefined` berawal dari situ.

## 6. Dua lapis validasi (sekarang tiga)

Aturan "judul tidak boleh kembar" kini hidup di tiga tempat — dan itu
disengaja:

| Lapis | Tempat | Menangkap | Hasilnya |
|---|---|---|---|
| 1. Controller | cek `findOne` sebelum `create` | kasus normal | `409` dengan pesan rapi |
| 2. Model | `unique: true` + `validate` di Buku.js | penulisan kode yang lupa cek | `SequelizeUniqueConstraintError` / `SequelizeValidationError` → diterjemahkan controller jadi `409`/`400` |
| 3. Database | `UNIQUE KEY`, `NOT NULL` (schema.sql) | dua request bersamaan yang lolos lapis 1 | error MySQL → `409` |

Controller menangkap error bernama itu dan menerjemahkannya (lihat
`storeBuku`):

```js
if (error.name === "SequelizeUniqueConstraintError") {
  return res.status(409).json({ msg: `Buku "${value.judul}" sudah terdaftar` });
}
if (error.name === "SequelizeValidationError") {
  return res.status(400).json({ msg: "Validasi gagal", ... });
}
throw error; // sisanya → asyncHandler → errorHandler → 500
```

Tanpa penerjemahan ini, input yang salah menjadi `500` — padahal yang salah
**client**, bukan server. Aturan `4xx vs 5xx` dari Minggu 1 tetap berlaku
di era ORM.

## 7. Query: where, order, paging

Pencarian Minggu 3:

```sql
WHERE (LOWER(judul) LIKE ? OR LOWER(penulis) LIKE ?) AND kategori = ?
```

versi ORM (`src/controllers/buku.js` → `filterPencarian`):

```js
kondisi.push({
  [Op.or]: [
    where(fn("LOWER", col("judul")), { [Op.like]: k }),
    where(fn("LOWER", col("penulis")), { [Op.like]: k }),
  ],
});
```

`Op` adalah operator Sequelize (`Op.like`, `Op.and`, `Op.or`, `Op.gte`,
...). `fn` dan `col` untuk fungsi/kolom SQL. Bandingkan dengan SQL mentahnya
di log — sama persis, tapi ditulis sebagai objek yang bisa dikomposisi.

**Dua hal yang tetap tanggung jawab kalian** meski memakai ORM:

1. **Whitelist kolom sort** — `ORDER BY` tidak menerima nilai terikat, jadi
   `sort` dari user tetap divalidasi lewat `KOLOM_SORT_BOLEH` sebelum
   masuk `order`. Ini tidak berubah dari Minggu 3.
2. **`findAndCountAll`** menggantikan dua query Minggu 3 (COUNT untuk
   total, SELECT untuk halaman) — satu pemanggilan, dua pekerjaan.

## 8. Kapan raw query masih diperlukan

Lihat `statistikBuku` di controller: agregasi GROUP BY masih bisa ditulis
dengan `fn`/`col`/`group`, tapi bandingkan dengan tiga `pool.query()` versi
Minggu 3 — versi SQL jauh lebih jelas.

| Situasi | Pilih |
|---|---|
| CRUD di satu tabel | Model |
| Relasi yang dibaca ikut kebutuhan | Model + `include` |
| Validasi dan transformasi yang menempel pada data | Model (`validate`, `set`, `get`) |
| Laporan kompleks, agregasi banyak tabel, window function | **Raw query** (`Buku.sequelize.query(...)` dengan `replacements` — pola `?` dari Minggu 3 tetap berlaku) |

ORM bukan pengganti SQL. Siapa pun yang tidak bisa membaca SQL tidak akan
bisa men-debug ORM — itulah kenapa minggu lalu kalian menulisnya manual
dulu. Sequelize juga tetap menyediakan raw query kapan pun diperlukan,
kapan pun kalian mengenal `dialectOptions`-nya.

## 9. Soft delete: paranoid

Sequelize punya model penghapusan yang berbeda dari `DELETE FROM`:

```js
// src/models/Buku.js — ubah satu baris (Latihan 5)
paranoid: true,
```

Setelah itu `destroy()` tidak lagi menghapus baris — dia hanya mengisi
`deletedAt`. Semua query Sequelize otomatis menyembunyikan baris yang
diarsir itu. Datanya masih ada di phpMyAdmin; `findOne` menganggapnya tidak
ada. Untuk membaca baris yang sudah "dihapus":
`Buku.unscoped().findOne({ where: { id } })`.

Konsekuensi yang harus kalian pikirkan di Latihan 5: kalau judul tetap
`UNIQUE`, buku yang di-soft-delete masih "menempati" judulnya — POST judul
yang sama akan bentrok dengan baris yang secara bisnis sudah dianggap
hilang. Tidak ada jawaban tunggal yang benar; ada dua keputusan desain yang
sah. Latihannya justru meminta kalian memilih satu dan bisa membela pilihan
itu.

## 10. Troubleshooting Sequelize

| Gejala | Penyebab | Solusi |
|---|---|---|
| `Buku is not associated to Karakter` | relasi hanya dideklarasikan satu sisi, atau `as` tidak cocok dengan `include` | samakan `as` di `associate` dan di controller |
| `Cannot read property 'Karakter' of undefined` | `associate` dijalankan sebelum model lain dibangun | lihat pola dua langkah di `models/index.js` |
| `Unknown column 'createdAt'` | model `timestamps: true` tapi tabelnya tidak punya kolom itu | samakan `schema.sql` dengan model |
| Validasi gagal jadi `500` | `SequelizeValidationError` tidak ditangkap | lihat bagian 6 |
| Response memuat `createdAt`/`updatedAt` | lupa `defaultScope` | lihat `src/models/Buku.js` |
| `[SQL]` banjir di terminal | memang begitu saat belajar | `logging: false` setelah selesai |
| `ECONNREFUSED` / `ER_ACCESS_DENIED` | MySQL mati / kredensial salah | sama seperti Minggu 3 — periksa `.env`, jalankan `db:migrate` |
| `Validation error` saat `npm run db:migrate` diulang | seed memuat judul yang sudah ada | wajar — seed TRUNCATE dulu, jalankan ulang saja |

---

Latihan dan tugas yang dikumpulkan ada di file terpisah: [TUGAS.md](TUGAS.md).
