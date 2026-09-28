# PANDUAN PRAKTIKUM MINGGU 5

## Form Validation dengan Joi

Mata Kuliah Arsitektur Berbasis Layanan (SOA) · S1 Sistem Informasi Bisnis, ISTTS

---

Endpoint buku tidak berubah dari Minggu 2-4. Yang berubah: validasi manual
(`aturanBuku` + `src/utils/validate.js`) diganti **schema Joi** — aturan dan
pesan errornya kini hidup di satu tempat, dan aturan yang TIDAK bisa
dinyatakan validasi per-field (lintas field) jadi mungkin. Bentuk response
error tetap sama: objek per field, isinya array — consumer tidak perlu tahu
mesin di belakangnya berganti.

## Daftar Isi

1. [Menjalankan project](#1-menjalankan-project)
2. [Dari validate() manual ke Joi: apa yang berubah](#2-dari-validate-manual-ke-joi-apa-yang-berubah)
3. [Membaca satu schema](#3-membaca-satu-schema)
4. [Semua error sekaligus: abortEarly](#4-semua-error-sekaligus-abortearly)
5. [Pesan bahasa Indonesia: label dan messages](#5-pesan-bahasa-indonesia-label-dan-messages)
6. [Aturan lintas field: Joi.ref dan .with()](#6-aturan-lintas-field-joiref-dan-with)
7. [stripUnknown: mass assignment dalam satu opsi](#7-stripunknown-mass-assignment-dalam-satu-opsi)
8. [Validasi parsial untuk PATCH](#8-validasi-parsial-untuk-patch)
9. [Tiga lapis validasi](#9-tiga-lapis-validasi)
10. [Troubleshooting Joi](#10-troubleshooting-joi)

---

## 1. Menjalankan project

Prasyarat sama seperti Minggu 4: Node 24, MySQL menyala.

```bash
npm install
cp .env.example .env        # sesuaikan kredensial MySQL
npm run db:migrate          # buat database soa_minggu5, tabel, data awal
npm run dev                 # http://localhost:3001
```

## Menguji

Impor `postman/SOA-Minggu5.postman_collection.json` +
`postman/local.postman_environment.json`, pilih environment `local`, jalankan
Runner: **34 request, 63 assertion** — 28 request lama (identik Minggu 2-4)
plus 6 request baru di folder **4 - Validasi Joi** untuk endpoint demo
`POST /api/v1/contoh/validasi`.

```bash
npx newman run postman/SOA-Minggu5.postman_collection.json \
  -e postman/local.postman_environment.json
```

Endpoint demo Joi **tidak menyentuh database** — tugasnya menunjukkan semua
fitur Joi lewat `userSchema` (`src/utils/validation/userSchema.js`).

## 2. Dari validate() manual ke Joi: apa yang berubah

| Aspek | Minggu 2-4 | Minggu 5 |
|---|---|---|
| Tempat aturan | `aturanBuku` di controller + `validate.js` | `src/utils/validation/bukuSchema.js` |
| Tempat pesan error | tersebar di validate.js | bersama aturannya, per kode error |
| Semua error sekaligus | fitur tulisan sendiri | `abortEarly: false` — satu opsi |
| Aturan lintas field | tidak ada | `Joi.ref()`, `.with()` |
| Buang field asing | kode manual | `stripUnknown: true` |
| Konversi tipe (`"40"` → 40) | kode manual | default Joi (`convert`) |
| Validasi PATCH | salin aturan, matikan required | `validasiParsial()` — `schema.extract()` |

Controller kini hanya bertanya "valid atau tidak":

```js
const { valid, errors, value } = validasiJoi(bukuSchema, req.body);
```

Bentuk return-nya `{ valid, errors, value }` — persis seperti `validate()`
lama. Karena itu bagian lain controller tidak berubah sama sekali.
File `src/utils/validate.js` **dihapus** minggu ini.

## 3. Membaca satu schema

Buka `src/utils/validation/bukuSchema.js`. Satu aturan Joi = satu field:

```js
judul: Joi.string()
  .min(3)
  .max(150)
  .required()          // wajib — yang tidak dikirim langsung dilaporkan
  .label("Judul")      // nama yang tampil di pesan error
  .messages({ ... }),  // pesan bahasa Indonesia per kode error
```

Yang penting diperhatikan:

- **`.required()` tidak diturunkan ke field lain.** Setiap field punya
  presence-nya sendiri — itulah yang membuat validasi parsial PATCH mungkin
  (bagian 8).
- **`.default(0)`** pada `stok`: field tidak dikirim → `value.stok = 0`.
  Perilaku identik dengan `default: 0` versi lama — DAN identik dengan
  `defaultValue: 0` di model Sequelize Minggu 4. Aturan yang sama di tiga
  lapis berbeda, masing-masing untuk pengunjung berbeda.
- **`.valid("novel", ...)`** = versi Joi dari `type: "enum"` — dan cermin
  dari `DataTypes.ENUM` di model serta `ENUM(...)` di MySQL.

## 4. Semua error sekaligus: abortEarly

Default Joi berhenti di error pertama. Dengan `abortEarly: false`
(sudah diset di `validasiJoi()`), satu request yang salah di lima field
melaporkan kelima-limanya:

```json
400 {
  "msg": "Validasi gagal",
  "errors": {
    "judul":        ["Judul minimal 3 karakter"],
    "penulis":      ["Penulis harus diisi"],
    "tahun_terbit": ["Tahun terbit minimal 1900"],
    "harga":        ["Harga harus berupa angka"],
    "kategori":     ["Kategori harus salah satu dari: novel, komik, non-fiksi, referensi"]
  }
}
```

Tanpa itu, pengguna memperbaiki satu, kirim, dapat error kedua, kirim
lagi — lima kali bolak-balik untuk satu form. Satu opsi, perbedaan besar.

## 5. Pesan bahasa Indonesia: label dan messages

Dua alat:

- **`.label("Judul")`** — nama field yang tampil di pesan. Tanpa ini,
  pesan menyebut nama kunci (`judul`) dalam bahasa Inggris Joi.
- **`.messages({...})`** — override per **kode error** Joi
  (`string.min`, `number.base`, `any.required`, `any.only`, ...).

Kalau custom message kalian TIDAK muncul, hampir pasti kode errornya salah.
Cara menemukan kode yang tepat — kirim payload yang salah lalu lihat
di console (atau `console.log(error.details[0].type)` di controller):

```text
error.details[0].type = "string.min"     <- pakai KODE INI di .messages()
```

> **Catatan tampilan:** Joi mengutip label dalam pesan (`"Judul" minimal 3
> karakter`). Itu perilaku standar, biarkan saja — yang penting konsisten
> di seluruh API.

## 6. Aturan lintas field: Joi.ref dan .with()

Aturan per-field (tipe, panjang, rentang) tidak bisa menyatakan hubungan
ANTAR field. Dua alat Joi untuk itu — lihat `userSchema`:

**`Joi.ref()`** — membandingkan dua field, contoh klasiknya konfirmasi
password:

```js
pengguna_konfirmasi_password: Joi.any()
  .equal(Joi.ref("pengguna_password"))
  .messages({ "any.only": "{#label} harus sama dengan password" }),
```

**`.with()`** — "kalau A dikirim, B wajib ikut":

```js
Joi.object({ ... })
  .with("app_name", "app_token")
```

Sending `app_name` tanpa `app_token` → 400. Mengirim keduanya, atau tidak
mengirim keduanya → sah. Coba di Postman: request
**app_name tanpa app_token**.

> **Bug klasik reshape:** error `.with()` bukan milik satu field —
> `item.context.key` kosong, yang ada `item.context.main`. Helper
> `reshape()` di `validateJoi.js` memakai
> `item.context.key || item.context.main` supaya error itu tidak jatuh ke
> key `undefined`.

## 7. stripUnknown: mass assignment dalam satu opsi

Minggu 2 kalian menulis pertahanan mass assignment dengan tangan: bangun
ulang objek dari field yang dipilih. Minggu 5, satu opsi Joi menggantikannya:

```js
schema.validate(body, { abortEarly: false, stripUnknown: true })
```

Body berisi `isAdmin: true` dan `diskon: 100`? Keduanya dibuang dari
`value` — tidak pernah sampai ke `Buku.create()`. Test Postman
**Mass assignment ditolak** masih hijau tanpa diubah.

Perhatikan lapis di BELAKANGNYA juga tidak dihapus: setter `keterangan`
di model tetap melempar error kalau ada yang mencoba mengisinya, dan model
tetap hanya menerima kolom yang dikenalnya. Belt and braces.

## 8. Validasi parsial untuk PATCH

PATCH berarti "ubah sebagian" — field yang tidak dikirim tidak boleh
dianggap error. Strateginya di `validasiParsial()`
(`src/utils/validation/validateJoi.js`):

1. Cari field body yang dikenal schema
   (`schema.describe().keys`).
2. Bangun schema BARU hanya dari field itu, dengan
   `schema.extract("harga")` — aturan, label, dan pesannya ikut.
3. Validasi, lalu **saring `value`**: hanya field yang memang ada di body
   yang lolos — supaya `.default()` stok tidak diam-diam mengisi 0.

```js
const { valid, errors, value, tanpaFieldDikenal } =
  validasiParsial(bukuSchema, req.body);
```

`tanpaFieldDikenal` bernilai `true` kalau body hanya berisi field asing —
controller menerjemahkannya menjadi `400 "Tidak ada field yang bisa diubah"`.

PUT tetap memakai schema penuh: ganti seluruhnya = semua field wajib.
Perilaku PUT vs PATCH identik dengan Minggu 2-4 — test Postman
**PUT tidak lengkap -> 400** dan **PATCH sebagian** membuktikannya.

## 9. Tiga lapis validasi

Tidak ada lapis yang dihapus minggu ini — malah makin jelas perannya:

| Lapis | Tempat | Menangkap | Hasil |
|---|---|---|---|
| 1. Joi | `src/utils/validation/` | bentuk & batasan input, lintas field | `400` + pesan per field |
| 2. Model Sequelize | `src/models/Buku.js` (`validate`, `unique`) | penulisan kode yang lolos dari controller | error Sequelize → `400`/`409` |
| 3. Database | `UNIQUE KEY`, `NOT NULL`, `ENUM` | dua request bersamaan | error MySQL → `409` |

Kapan lapis 2 menangkap sesuatu yang luput dari Joi? Contoh:
`tahun_terbit: 2050` — Joi membatasi sampai tahun sekarang, model sampai
2100. Kalau suatu hari aturan controller dilonggarkan (atau ditulis langsung
lewat model), model yang menjaga. Lapisan bukan pengulangan; dia jaring
untuk jalur yang belum ada hari ini.

## 10. Troubleshooting Joi

| Gejala | Penyebab | Solusi |
|---|---|---|
| Custom message tidak muncul | kode error di `.messages()` salah | `console.log(error.details[0].type)` untuk menemukan kodenya |
| Hanya error pertama dilaporkan | lupa `abortEarly: false` | sudah diset di `validasiJoi()` — jangan diubah |
| Regex password tidak pernah cocok | satu backslash di string regex: `\d` bukan `\\d` | gandakan backslash; tes dulu di regexr.com |
| Error jatuh ke key `undefined` | error lintas field tanpa `context.key` | pakai `item.context.key \|\| item.context.main` (sudah di `reshape()`) |
| `.default()` ikut bekerja di PATCH | value berisi field yang tidak dikirim | filter di `validasiParsial()` — jangan dihapus |
| `schema.extract is not a function` | yang di-extract bukan objek schema | pastikan mengekstrak dari schema `.object()` |
| Field asing masuk database | `stripUnknown` dihapus dari opsi | kembalikan; itu pertahanan mass assignment |
| Semua request jadi `400` | body JSON tidak terbaca | cek `express.json()` terpasang sebelum router (Minggu 2) |

---

Latihan dan tugas yang dikumpulkan ada di file terpisah: [TUGAS.md](TUGAS.md).
