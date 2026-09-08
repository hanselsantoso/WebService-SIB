/**
 * CONTROLLER BUKU
 * ===============
 *
 * Controller menjawab pertanyaan "APA yang terjadi".
 * Router menjawab "KE MANA request ini pergi".
 *
 * Setiap fungsi di sini berbentuk sama: (req, res) => { ... }
 * dan selalu diakhiri `return res...`.
 *
 * Kenapa selalu `return`?
 * Tanpa `return`, eksekusi lanjut ke baris berikutnya dan kalian
 * berpotensi mengirim response DUA KALI. Errornya berbunyi:
 *   "Cannot set headers after they are sent to the client"
 * Ini bug Minggu 2 nomor satu, dan obatnya cuma satu kata: return.
 */

const store = require("../data/buku");
const validate = require("../utils/validate");

/* ================================================================== */
/* ATURAN VALIDASI                                                     */
/* Ditulis sekali di atas, dipakai ulang di POST dan PUT.              */
/* Minggu 5 bagian ini diganti Joi.                                    */
/* ================================================================== */
const aturanBuku = {
  judul: {
    type: "string",
    required: true,
    label: "Judul",
    minLength: 3,
    maxLength: 150,
  },
  penulis: {
    type: "string",
    required: true,
    label: "Penulis",
    minLength: 3,
    maxLength: 100,
  },
  tahun_terbit: {
    type: "number",
    required: true,
    integer: true,
    label: "Tahun terbit",
    min: 1900,
    max: new Date().getFullYear(),
  },
  harga: {
    type: "number",
    required: true,
    label: "Harga",
    min: 0,
  },
  stok: {
    type: "number",
    required: false,
    integer: true,
    label: "Stok",
    min: 0,
    default: 0, // kalau tidak dikirim, dianggap 0
  },
  kategori: {
    type: "enum",
    required: true,
    label: "Kategori",
    values: ["novel", "komik", "non-fiksi", "referensi"],
  },
};

/* ================================================================== */
/* HELPER                                                              */
/* ================================================================== */

// req.params SELALU string. "3" !== 3, jadi konversi wajib.
const cariBuku = (id) => store.buku.find((b) => b.id === Number(id));

// Hanya field ringkas untuk tampilan daftar.
// Mengembalikan seluruh objek termasuk array karakter itu boros
// kalau consumer cuma mau menampilkan judul dan harga.
const ringkas = (b) => ({
  id: b.id,
  judul: b.judul,
  penulis: b.penulis,
  harga: b.harga,
  stok: b.stok,
});

/* ================================================================== */
/* GET /api/v1/buku                                                    */
/* Query: ?keyword= &kategori= &limit= &offset= &sort= &order=         */
/* ================================================================== */
const queryBuku = (req, res) => {
  const { keyword, kategori, limit, offset, sort, order } = req.query;

  let hasil = [...store.buku]; // salin dulu, jangan mengubah data asli

  // --- filter ------------------------------------------------------
  if (keyword) {
    const k = keyword.toLowerCase();
    hasil = hasil.filter(
      (b) =>
        b.judul.toLowerCase().includes(k) || b.penulis.toLowerCase().includes(k)
    );
  }

  if (kategori) {
    hasil = hasil.filter((b) => b.kategori === kategori);
  }

  // --- urutkan -----------------------------------------------------
  // Whitelist kolom. Kalau langsung memakai `sort` dari user,
  // consumer bisa mengurutkan berdasarkan field internal apa pun.
  const kolomBoleh = ["id", "judul", "harga", "tahun_terbit", "stok"];
  if (sort && kolomBoleh.includes(sort)) {
    const arah = order === "desc" ? -1 : 1;
    hasil.sort((a, b) => (a[sort] > b[sort] ? arah : a[sort] < b[sort] ? -arah : 0));
  }

  // --- paging ------------------------------------------------------
  const total = hasil.length;
  const off = Number(offset) || 0;
  const lim = Number(limit) || 0;
  hasil = lim === 0 ? hasil.slice(off) : hasil.slice(off, off + lim);

  // --- bentuk response ---------------------------------------------
  // Daftar kosong itu BUKAN error. Pencarian yang tidak menemukan apa pun
  // adalah pencarian yang berhasil dengan hasil nol.
  // Jadi: 200 dengan array kosong, BUKAN 404.
  return res.status(200).json({
    total,
    limit: lim,
    offset: off,
    data: hasil.map(ringkas),
  });
};

/* ================================================================== */
/* GET /api/v1/buku/statistik                                          */
/*                                                                     */
/* !! PERHATIKAN URUTANNYA DI FILE ROUTES !!                           */
/* Route ini HARUS didaftarkan SEBELUM /:bukuId.                       */
/* Kalau tidak, Express menangkap "statistik" sebagai nilai :bukuId    */
/* dan kalian akan dapat 404 yang membingungkan.                       */
/* ================================================================== */
const statistikBuku = (req, res) => {
  const total = store.buku.length;
  const totalStok = store.buku.reduce((sum, b) => sum + b.stok, 0);
  const habis = store.buku.filter((b) => b.stok === 0).length;

  const perKategori = store.buku.reduce((acc, b) => {
    acc[b.kategori] = (acc[b.kategori] || 0) + 1;
    return acc;
  }, {});

  const termahal = store.buku.reduce(
    (max, b) => (b.harga > max.harga ? b : max),
    { harga: -1 }
  );

  return res.status(200).json({
    total_judul: total,
    total_stok: totalStok,
    judul_stok_habis: habis,
    per_kategori: perKategori,
    termahal: termahal.harga >= 0 ? ringkas(termahal) : null,
  });
};

/* ================================================================== */
/* GET /api/v1/buku/:bukuId                                            */
/* ================================================================== */
const getSingleBuku = (req, res) => {
  const buku = cariBuku(req.params.bukuId);

  // Satu resource yang diminta secara spesifik TIDAK ADA -> 404.
  // Bedakan dengan daftar kosong di atas yang tetap 200.
  if (!buku) {
    return res
      .status(404)
      .json({ msg: `Buku dengan id ${req.params.bukuId} tidak ditemukan` });
  }

  return res.status(200).json(buku); // lengkap, termasuk karakter
};

/* ================================================================== */
/* GET /api/v1/buku/:bukuId/karakter                                   */
/* GET /api/v1/buku/:bukuId/karakter/:karakterId                       */
/*                                                                     */
/* Nested resource: karakter tidak punya arti tanpa bukunya.           */
/* Karena itu URL-nya bersarang, bukan /api/v1/karakter/1.             */
/* ================================================================== */
const getKarakter = (req, res) => {
  const { bukuId, karakterId } = req.params;

  const buku = cariBuku(bukuId);
  if (!buku) {
    return res.status(404).json({ msg: `Buku dengan id ${bukuId} tidak ditemukan` });
  }

  // Ada DUA kondisi 404 yang berbeda di sini, dan pesannya harus berbeda.
  // "Buku tidak ditemukan" dan "Karakter tidak ditemukan" adalah dua
  // masalah berbeda bagi consumer kita.
  if (karakterId) {
    const karakter = buku.karakter.find((c) => c.id === Number(karakterId));
    if (!karakter) {
      return res
        .status(404)
        .json({ msg: `Karakter dengan id ${karakterId} tidak ada pada buku ini` });
    }
    return res.status(200).json(karakter);
  }

  return res.status(200).json({
    buku_id: buku.id,
    judul: buku.judul,
    total: buku.karakter.length,
    data: buku.karakter,
  });
};

/* ================================================================== */
/* POST /api/v1/buku                                                   */
/* ================================================================== */
const storeBuku = (req, res) => {
  const { valid, errors, value } = validate(req.body, aturanBuku);

  if (!valid) {
    return res.status(400).json({ msg: "Validasi gagal", errors });
  }

  // Aturan bisnis: judul tidak boleh kembar.
  // Ini BUKAN validasi format, jadi tempatnya di sini, bukan di validate().
  const kembar = store.buku.find(
    (b) => b.judul.toLowerCase() === value.judul.toLowerCase()
  );
  if (kembar) {
    // 409 Conflict, bukan 400. Datanya benar; keadaan server yang bentrok.
    return res.status(409).json({ msg: `Buku "${value.judul}" sudah terdaftar` });
  }

  const idBaru =
    store.buku.length === 0 ? 1 : Math.max(...store.buku.map((b) => b.id)) + 1;

  // Perhatikan: kita membangun objek dari `value`, BUKAN dari req.body.
  // Inilah pertahanan terhadap mass assignment.
  const bukuBaru = { id: idBaru, ...value, karakter: [] };

  store.buku.push(bukuBaru);

  // 201 Created + header Location menunjuk ke resource yang baru dibuat.
  // Header Location ini sering dilupakan padahal bagian dari REST yang benar.
  return res
    .status(201)
    .location(`/api/v1/buku/${idBaru}`)
    .json(bukuBaru);
};

/* ================================================================== */
/* PUT /api/v1/buku/:bukuId — GANTI SELURUHNYA                         */
/* ================================================================== */
const updateBuku = (req, res) => {
  const { bukuId } = req.params;
  const buku = cariBuku(bukuId);

  if (!buku) {
    return res.status(404).json({ msg: `Buku dengan id ${bukuId} tidak ditemukan` });
  }

  // PUT = ganti seluruhnya, jadi SEMUA field wajib dikirim.
  // Aturan validasinya sama persis dengan POST.
  const { valid, errors, value } = validate(req.body, aturanBuku);
  if (!valid) {
    return res.status(400).json({ msg: "Validasi gagal", errors });
  }

  const index = store.buku.findIndex((b) => b.id === Number(bukuId));

  store.buku[index] = {
    id: buku.id,           // id tidak boleh diganti lewat body
    ...value,
    karakter: buku.karakter, // relasi dipertahankan
  };

  return res.status(200).json(store.buku[index]);
};

/* ================================================================== */
/* PATCH /api/v1/buku/:bukuId — UBAH SEBAGIAN                          */
/* ================================================================== */
const patchBuku = (req, res) => {
  const { bukuId } = req.params;
  const buku = cariBuku(bukuId);

  if (!buku) {
    return res.status(404).json({ msg: `Buku dengan id ${bukuId} tidak ditemukan` });
  }

  // Body kosong pada PATCH artinya "ubah tidak ada apa-apa" -> tidak masuk akal.
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ msg: "Tidak ada field yang dikirim untuk diubah" });
  }

  // Inilah bedanya dengan PUT: aturan disalin, lalu SEMUA required dimatikan,
  // dan hanya field yang benar-benar dikirim yang divalidasi.
  const aturanParsial = {};
  for (const [field, rule] of Object.entries(aturanBuku)) {
    if (field in req.body) {
      aturanParsial[field] = { ...rule, required: false };
      delete aturanParsial[field].default; // jangan isi default saat PATCH
    }
  }

  if (Object.keys(aturanParsial).length === 0) {
    return res
      .status(400)
      .json({ msg: "Tidak ada field yang bisa diubah pada request ini" });
  }

  const { valid, errors, value } = validate(req.body, aturanParsial);
  if (!valid) {
    return res.status(400).json({ msg: "Validasi gagal", errors });
  }

  const index = store.buku.findIndex((b) => b.id === Number(bukuId));
  store.buku[index] = { ...buku, ...value }; // gabung: lama ditimpa yang baru

  return res.status(200).json(store.buku[index]);
};

/* ================================================================== */
/* DELETE /api/v1/buku/:bukuId                                         */
/* ================================================================== */
const deleteBuku = (req, res) => {
  const { bukuId } = req.params;
  const buku = cariBuku(bukuId);

  if (!buku) {
    return res.status(404).json({ msg: `Buku dengan id ${bukuId} tidak ditemukan` });
  }

  // .filter() menghasilkan array BARU. Karena itu data diekspor
  // dalam objek pembungkus — lihat komentar di src/data/buku.js.
  store.buku = store.buku.filter((b) => b.id !== Number(bukuId));

  return res.status(200).json({ msg: `Buku "${buku.judul}" telah dihapus` });

  // Alternatif yang juga benar: 204 No Content, tanpa body sama sekali.
  //   return res.status(204).send();
  // Dua-duanya sah. Yang penting kalian KONSISTEN di seluruh API,
  // dan mendokumentasikan pilihan kalian.
};

module.exports = {
  queryBuku,
  statistikBuku,
  getSingleBuku,
  getKarakter,
  storeBuku,
  updateBuku,
  patchBuku,
  deleteBuku,
};
