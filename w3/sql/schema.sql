-- ============================================================
-- SKEMA DATABASE — SOA MINGGU 3
-- ============================================================
--
-- Bandingkan file ini dengan src/data/buku.js versi Minggu 2 (lihat git log).
-- Array `let buku = [...]` sekarang menjadi DUA tabel: `buku` dan `karakter`,
-- dihubungkan lewat foreign key. Ini yang disebut NORMALISASI: karakter
-- tidak lagi "menempel" di dalam objek buku, dia baris sendiri yang
-- MENUNJUK ke buku-nya.
--
-- Jalankan file ini via `npm run db:migrate` (lihat scripts/migrate.js),
-- atau import manual lewat MySQL Workbench / `mysql` CLI kalau mau
-- membaca hasilnya baris demi baris.

CREATE TABLE IF NOT EXISTS buku (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  judul         VARCHAR(150) NOT NULL,
  penulis       VARCHAR(100) NOT NULL,
  tahun_terbit  SMALLINT UNSIGNED NOT NULL,
  harga         INT UNSIGNED NOT NULL,
  stok          INT UNSIGNED NOT NULL DEFAULT 0,
  kategori      ENUM('novel', 'komik', 'non-fiksi', 'referensi') NOT NULL,

  -- UNIQUE di sini adalah JARING PENGAMAN KEDUA untuk aturan "judul tidak
  -- boleh kembar". Jaring pengaman PERTAMA tetap di controller (SELECT
  -- dulu sebelum INSERT), karena itu yang menentukan pesan error rapi
  -- (409 + pesan Indonesia) alih-alih error mentah dari MySQL.
  -- Constraint ini menjaga kalau suatu saat ada jalur INSERT lain yang
  -- lupa memanggil pengecekan itu. Baca PANDUAN.md §15
  -- "Dua lapis validasi" untuk penjelasan lengkap.
  UNIQUE KEY uq_buku_judul (judul)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS karakter (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  buku_id   INT UNSIGNED NOT NULL,
  nama      VARCHAR(100) NOT NULL,
  peran     VARCHAR(50) NOT NULL,

  -- ON DELETE CASCADE: hapus satu baris `buku`, MySQL sendiri yang
  -- menghapus semua karakter miliknya. Di Minggu 2 ini dikerjakan manual
  -- lewat .filter() di memori; di MySQL ini pekerjaan database, bukan
  -- pekerjaan kode kita. Coba hapus sebuah buku lalu SELECT tabel
  -- karakter — baris-baris karakternya sudah ikut hilang tanpa satu
  -- baris kode pun di controller.
  CONSTRAINT fk_karakter_buku
    FOREIGN KEY (buku_id) REFERENCES buku(id)
    ON DELETE CASCADE,

  INDEX idx_karakter_buku_id (buku_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabel kedua: untuk LATIHAN 6 (kalian yang membangun controller
-- dan route-nya sendiri, mengikuti pola buku).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS penulis (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama          VARCHAR(100) NOT NULL,
  negara        VARCHAR(100) NOT NULL,
  tahun_lahir   SMALLINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
