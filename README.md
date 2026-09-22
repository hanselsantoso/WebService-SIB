# Praktikum Web Service (SOA)

Arsitektur Berbasis Layanan · S1 Sistem Informasi Bisnis, ISTTS
Ong, Hansel Santoso, S.Si., M.Kom.

Repository starter praktikum per minggu. Stack: Express, MySQL
(`mysql2/promise`, Sequelize menyusul), Postman.

## Isi tiap folder minggu

Setiap folder minggu (`w1`, `w2`, ...) punya struktur yang sama:

| File | Isi |
|---|---|
| `README.md` | Ringkasan: cara menjalankan, daftar endpoint, catatan versi |
| `PANDUAN.md` | Cara install + penjelasan materi minggu tersebut |
| `TUGAS.md` | Latihan dan tugas yang dikumpulkan (bila ada) |
| `postman/` | Koleksi Postman untuk mengetes semua endpoint |
| `src/` | Kode starter project |

## Daftar minggu

| Minggu | Materi | Folder |
|---|---|---|
| 1 | Pengantar web service & review JavaScript | [`w1/`](w1/) |
| 2 | REST service dasar dengan Express | [`w2/`](w2/) |
| 3 | REST service dengan MySQL | [`w3/`](w3/) |
| 4 | ORM — model & relasi Sequelize | [`w4/`](w4/) |
| 5 | Form validation dengan Joi | *(menyusul)* |
| 6 | 3rd party API dengan axios | *(menyusul)* |
| 7 | Auth & middleware dengan JWT | *(menyusul)* |
| — | **UTS** | |
| 8 | Business model — API key & rate limit | *(menyusul)* |
| 9 | Database migration | *(menyusul)* |
| 10 | Dokumentasi Postman & automated testing | *(menyusul)* |
| 11 | File upload dengan multer | *(menyusul)* |
| 12 | Hosting | *(menyusul)* |
| 13 | OAuth2 | *(menyusul)* |
| 14 | GraphQL dengan Apollo | *(menyusul)* |

## Ringkasan alur materi

```text
w1  JavaScript + konsep web service        (tanpa project)
w2  Express: CRUD in-memory                (routes → controllers)
w3  MySQL: persistence                     (pool, prepared statement)
    Endpoint TIDAK berubah dari w2 → w3 → w4. Yang berubah implementasinya.
```

Setiap minggu mengganti implementasi di balik antarmuka yang sama —
koleksi Postman dari Minggu 2 harus tetap hijau sampai Minggu 14.
Itu bukti kalian membangun **antarmuka**, bukan sekadar kode.

## Instalasi umum (sekali di awal semester)

```bash
node --version          # v24 LTS
npm install -g nodemon
```

Plus [VS Code](https://code.visualstudio.com/) dan
[Postman desktop](https://www.postman.com/downloads/).
Detail per minggu ada di `PANDUAN.md` masing-masing folder.
