/**
 * CONTROLLER CONTOH AXIOS — MINGGU 6
 * ==================================
 *
 * Selama lima minggu service kita hanya MELAYANI. Minggu ini ia juga
 * MENGINJAK — memanggil API orang lain (jikan.moe), dan itu mengubah
 * sesuatu yang fundamental: sekarang ada dependensi yang tidak kita
 * kendalikan, tidak bisa kita perbaiki, dan tidak bisa kita percepat.
 *
 * Tiga pelajaran di controller ini, berurutan:
 *
 *   1. KONTRAK MILIK KITA — response jikan tidak diteruskan mentah.
 *      Kita memilih delapan field, dan consumer HANYA bergantung pada
 *      delapan field itu. Kalau jikan mengubah payload-nya besok,
 *      yang kita perbaiki satu tempat di sini.
 *
 *   2. NULL-SAFE — field opsional upstream (trailer sering null) tidak
 *      boleh menjatuhkan service kita. `?.` dan `?? null` ada untuk data
 *      yang bukan buatan kita.
 *
 *   3. GAGAL DENGAN SOPAN — upstream timeout -> 504, upstream error ->
 *      502, kesalahan kita -> 500. Dan TIDAK PERNAH menunggu selamanya:
 *      `timeout: 5000` wajib.
 */
const axios = require("axios");
const { kirimNotifikasi } = require("../utils/notifikasi");

const UPSTREAM = "https://api.jikan.moe/v4/anime";

/**
 * KONTRAK FIELD — daftar ini adalah perjanjian kita dengan consumer.
 * Test Postman "returns only the fields we promised" menegakkannya.
 * Field di luar daftar ini TIDAK BOLEH bocor ke response — itu pula
 * yang membuat upstream bebas mengubah payload-nya sendiri.
 */
const KONTRAK_ANIME = ["mal_id", "url", "title", "trailer", "type", "episodes", "status", "rating"];

/**
 * Upstream -> kontrak kita. Satu-satunya tempat yang tahu bentuk
 * payload jikan.
 */
const petakanKeKontrak = (item) => ({
  mal_id: item.mal_id,
  url: item.url,
  title: item.title,
  // Trailer sering null di jikan. `item.trailer.url` tanpa `?.` =
  // "Cannot read property 'url' of null" -> 500 untuk data yang bukan
  // salah kita. Optional chaining + nullish coalescing: ?. dan ?? null.
  trailer: item.trailer?.url ?? null,
  type: item.type,
  episodes: item.episodes,
  status: item.status,
  rating: item.rating,
});

/* ================================================================== */
/* GET /api/v1/contohAxios?q=jojo&limit=3                              */
/*                                                                     */
/* Upstream publik SANGGUP menggagalkan kita: jikan sesekali menjawab  */
/* 5xx (gateway-nya tersendat, bukan salah kita). Maka: SATU kali      */
/* retry untuk 5xx saja.                                               */
/*                                                                     */
/* Kenapa HANYA 5xx? Ulangi permintaan yang salah (4xx) tidak akan      */
/* berubah jadi benar -- bad request tetap bad request. Yang boleh      */
/* dicoba lagi adalah kegagalan SEMENTARA, dan 5xx itulah.             */
/* ================================================================== */
const queryAnime = async (req, res) => {
  let perintah;

  try {
    for (let percobaan = 1; percobaan <= 2; percobaan++) {
      try {
        perintah = await axios.get(UPSTREAM, {
          // Forward query string pemanggil: ?q= &limit= &page= ...
          // Consumer kita memfilter anime TANPA perlu tahu nama parameter
          // jikan -- tapi karena kita meneruskan apa adanya, mereka
          // (untuk saat ini) sama saja. Kontrak eksplisit lebih baik;
          // itulah Latihan 2.
          params: req.query,

          // WAJIB. Tanpa timeout, axios menunggu SELAMANYA -- upstream
          // yang menggantung memegang request kita terbuka, cukup banyak
          // request menggantung dan service kita berhenti menjawab
          // siapa pun. Outage yang bukan salah kita, tapi yang kita
          // tanggung.
          timeout: 5000,
        });
        break; // berhasil -- keluar dari loop retry
      } catch (upstream) {
        const bolehUlangi =
          percobaan < 2 && upstream.response && upstream.response.status >= 500;
        if (!bolehUlangi) throw upstream;
        console.warn(`[contohAxios] upstream ${upstream.response.status}, coba ulang...`);
        await new Promise((selesai) => setTimeout(selesai, 1000)); // jeda 1 detik
      }
    }

    const data = perintah.data.data; // axios membungkus di .data, jikan juga
    const hasil = data.map(petakanKeKontrak);

    return res.status(200).json({ total: hasil.length, data: hasil });
  } catch (error) {
    // Gagal memanggil upstream BUKAN 500-nya kita. Bedakan tiga situasi:
    if (error.code === "ECONNABORTED") {
      // timeout yang kita pasang sendiri meledak
      return res
        .status(504)
        .json({ msg: "Layanan pihak ketiga tidak merespon" });
    }
    if (error.response) {
      // upstream MENJAWAB, tapi dengan error (4xx/5xx)
      console.error("[contohAxios] upstream:", error.response.status, error.response.data);
      if (error.response.status === 429) {
        // rate limit upstream -- teruskan pesannya ke consumer
        return res
          .status(429)
          .json({ msg: "Terlalu banyak request ke layanan pihak ketiga" });
      }
      return res
        .status(502)
        .json({ msg: "Layanan pihak ketiga mengembalikan error" });
    }
    // sisanya: request tidak pernah sampai (ECONNREFUSED, ENOTFOUND) --
    // atau bug kita sendiri. 500, pesan generik, detail di log.
    console.error("[contohAxios]", error.message);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

/* ================================================================== */
/* POST /api/v1/contohAxios/webhook  { "pesan": "..." }                */
/*                                                                     */
/* Endpoint latihan: buktikan sendiri bahwa webhook yang gagal TIDAK   */
/* menggagalkan request. Isi DISCORD_WEBHOOK_URL di .env dengan URL    */
/* yang benar, kirim, lihat pesan muncul di Discord. Lalu rusak        */
/* URL-nya, kirim lagi: responsenya tetap 200.                         */
/* ================================================================== */
const ujiWebhook = async (req, res) => {
  const { pesan } = req.body || {};

  if (!pesan || typeof pesan !== "string") {
    return res.status(400).json({ msg: "Body harus berisi { pesan: '...' }" });
  }

  await kirimNotifikasi(pesan);

  // 200 SELALU -- bukan 500 kalau Discord down. Itulah seluruh poinnya.
  return res.status(200).json({
    msg: "Notifikasi dikirim (kalau DISCORD_WEBHOOK_URL terpasang)",
  });
};

module.exports = { queryAnime, ujiWebhook, KONTRAK_ANIME };
