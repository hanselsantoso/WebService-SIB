# TUGAS PRAKTIKUM MINGGU 7

Mata Kuliah Arsitektur Berbasis Layanan (SOA) · S1 Sistem Informasi Bisnis, ISTTS

Latihan memperkuat konsep dari [PANDUAN.md](PANDUAN.md). Jawaban Latihan
1 dan 8 dicatat di `LATIHAN.md`; latihan lain cukup dicoba langsung.

---

## Latihan

### Latihan 1 — Rasakan bug auth

Ubah satu hal sekali, amati, lalu kembalikan:

1. Hapus `return` pada response 401 di `verifyJWT`. Panggil profil tanpa
   token. Periksa log server dan jelaskan mengapa response ganda terjadi.
2. Hapus `next()` setelah token valid. Panggil profil dengan token. Apa
   yang dilihat client?
3. Tambahkan sementara `roles` dari `req.body` pada object `Pengguna.create`
   di `register`. Register dengan `{"roles":"admin"}`. Mengapa ini celah
   privilege escalation, bukan sekadar validasi yang kurang?
4. Tukar urutan `verifyJWT` dan `checkRoles("admin")` di route
   `/rahasia`. Amati error saat request tanpa token.
5. Untuk demonstrasi lokal SAJA, samakan kedua JWT secret dan verifikasi
   refresh token dengan access secret. Decode token dan jelaskan mengapa
   pemisahan secret penting. Kembalikan perubahan setelah demonstrasi.

### Latihan 2 — Baca payload JWT

Login, decode access token di jwt.io atau dengan Node:

```bash
node -e "console.log(Buffer.from(process.argv[1].split('.')[1], 'base64url').toString())" '<TOKEN>'
```

Pastikan payload terbaca tanpa secret. **Catat di `LATIHAN.md`:** data
apa yang sebaiknya tidak pernah masuk payload JWT, dan alasannya.

### Latihan 3 — Hash bukan enkripsi

Register dua akun dengan password yang sama. Bandingkan hash di database:
hash berbeda karena bcrypt membuat salt otomatis. Jalankan
`bcrypt.compare()` untuk memastikan keduanya tetap cocok.

### Latihan 4 — Lindungi satu route bisnis

Pasang `verifyJWT` pada `GET /api/v1/buku/:bukuId` saja. Uji tiga kondisi:

| Request | Hasil yang diharapkan |
|---|---|
| tanpa token | 401 |
| token rusak | 403 |
| token sah | response endpoint sebelumnya tetap sama |

Jangan pasang auth ke seluruh router sekaligus: buktikan route yang tidak
dilindungi tetap berfungsi.

### Latihan 5 — Logout yang sungguh mencabut refresh token (opsional)

Saat ini logout hanya membersihkan cookie browser. Token yang sudah disalin
tetap berlaku sampai kedaluwarsa. Tambahkan penyimpanan refresh token di
database dan pencabutan saat logout. Tulis alasan desain di README.

### Latihan 6 — Akses data milik sendiri (opsional)

Tambahkan `GET /api/v1/pengguna/:id` yang hanya boleh mengembalikan data
caller sendiri. Jangan percaya ID dari URL saja: bandingkan dengan
`req.pengguna.id` dari token. Uji token akun A mencoba membaca akun B.

### Latihan 7 — Expiry

Login, tunggu lebih dari 30 detik, lalu panggil profil memakai access token
lama. Harapkan 403. Panggil refresh dengan cookie, lalu profil dengan
access token baru. Harapkan 200.

### Latihan 8 — Refleksi

Tulis jawaban singkat di `LATIHAN.md`:

1. Apa beda autentikasi dan otorisasi? Berikan contoh endpoint dari project.
2. Mengapa username tidak ditemukan dan password salah memakai pesan yang
   sama? Mengapa implementasi juga membandingkan dummy hash?
3. Apa kelemahan logout yang hanya menghapus cookie?
4. Apa yang boleh dan tidak boleh ditaruh di payload JWT?

---

## Tugas yang dikumpulkan

**Tambahkan autentikasi dan otorisasi pada project rental kendaraan** dari
praktikum sebelumnya. Terapkan pola access/refresh token pada alur login,
dan batasi operasi sesuai role.

### Persyaratan

- [ ] Password disimpan dengan bcrypt/bcryptjs; password atau hash tidak
      muncul di response API.
- [ ] Register selalu membuat role `visitor`; client tidak bisa memilih
      `admin` lewat body.
- [ ] Login memberi access token berumur pendek dan refresh token di cookie
      `httpOnly`. Gunakan dua secret acak yang berbeda di `.env`.
- [ ] `verifyJWT` melindungi route yang dipilih; `checkRoles` melindungi
      minimal satu operasi admin. Autentikasi berjalan sebelum otorisasi.
- [ ] Status 401/403 dibedakan dan diuji; pesan login gagal sama untuk
      username tidak dikenal dan password salah.
- [ ] Koleksi Postman mencakup register, login, route tanpa token, token
      rusak, role tidak cukup, refresh, dan logout.
- [ ] Tambahkan deskripsi README: route yang dilindungi, role yang boleh
      mengakses, dan batasan logout/token revocation.
- [ ] Pastikan `.env` serta token/hash nyata tidak ikut repository.

### Penilaian

| Kriteria | Bobot | Nilai penuh berarti |
|---|---:|---|
| Password | 25% | Hash bcrypt, tidak pernah dikembalikan, pesan login generik |
| Token | 25% | Access/refresh berbeda secret, expiry, cookie `httpOnly`, payload minimal |
| Middleware | 25% | `verifyJWT` dan `checkRoles` benar, urutan benar |
| Status & pengujian | 15% | 401/403 tepat; kasus gagal diuji di Postman |
| Secret hygiene | 10% | `.env` tidak di-commit; dua secret acak berbeda |
