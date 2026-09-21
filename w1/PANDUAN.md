# PANDUAN MINGGU 1

## Pengantar Web Service & Review JavaScript

Mata Kuliah Arsitektur Berbasis Layanan (SOA) · S1 Sistem Informasi Bisnis, ISTTS

---

Minggu ini minggu paling ringan sekaligus paling menentukan: **belum ada
Express yang ditulis mahasiswa**, tapi semua fitur JavaScript yang dipakai
setiap minggu setelahnya direview di sini. Kalau `map`, `find`, `filter`,
dan `reduce` belum lancar, setiap controller mulai Minggu 2 akan terasa
berat — jadi habiskan waktunya di sini.

## Daftar Isi

1. [Yang harus diinstall](#1-yang-harus-diinstall)
2. [Menjalankan demo](#2-menjalankan-demo)
3. [Materi: apa itu web service](#3-materi-apa-itu-web-service)
4. [Materi: HTTP verb dan status code](#4-materi-http-verb-dan-status-code)
5. [Materi: review JavaScript](#5-materi-review-javascript)
6. [Materi: array functions](#6-materi-array-functions)
7. [Materi: async/await — pandangan pertama](#7-materi-asyncawait--pandangan-pertama)

---

## 1. Yang harus diinstall

Install sebelum atau selama sesi, dan buktikan semuanya jalan:

### Node.js

Unduh installer LTS dari [nodejs.org](https://nodejs.org) (versi **24.x**), lalu:

```bash
node --version
npm --version
npx --version
```

### nodemon

Supaya server otomatis restart setiap kali file disimpan:

```bash
npm install -g nodemon
```

### VS Code

Rekomendasi extension untuk mata kuliah ini:

- Node.js Extension Pack — Wade Anderson
- node-snippets — Chris Noring
- JavaScript (ES6) code snippets — Charalampos Karypidis
- JavaScript Booster — Stephan Burguchev
- Prettier — code formatter

### Postman

Postman **desktop app** dari [postman.com/downloads](https://www.postman.com/downloads/).
Buat akun gratis — desktop app butuh akun untuk membuka koleksi. **Jangan
pakai versi web**: versi web tidak bisa menjangkau `localhost`.

## 2. Menjalankan demo

Project demo minggu ini ada di folder ini:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` di browser. Yang muncul bukan halaman HTML,
melainkan JSON — dan itu inti dari mata kuliah ini.

Coba ketiga endpoint demo di Postman:

- `GET http://localhost:3000/api/v1/contoh?nama=jojo&umur=40`
- `GET http://localhost:3000/api/v1/contoh/jojo/umur/40/jk/L`
- `POST http://localhost:3000/api/v1/contoh` dengan body JSON `{ "nama": "jojo" }`

## 3. Materi: apa itu web service

Buka di browser:

```text
https://api.jikan.moe/v4/anime?q=jojo&limit=3
```

Tidak ada halaman — hanya JSON. **Itulah web service.** Buka DevTools →
tab Network, reload, klik request-nya, dan perhatikan: method, URL, request
headers, status code, response headers, response body. Delapan bagian
anatomi pertukaran HTTP ini harus bisa kalian sebutkan di akhir minggu.

Pertanyaan kunci: **siapa pengguna web service?** Jawabannya: program lain,
bukan manusia. Satu sudut pandang ini yang membedakan mata kuliah ini dari
mata kuliah pemrograman web — selama satu semester kita tidak membuat
frontend sama sekali, karena pengguna layanan kita adalah aplikasi lain.

## 4. Materi: HTTP verb dan status code

Kosakata bersama yang dipakai setiap minggu sampai Minggu 14:

| Verb | Artinya | Aman? | Idempotent? |
|---|---|---|---|
| GET | Membaca resource | Ya | Ya |
| POST | Membuat, atau memicu proses | Tidak | Tidak |
| PUT | Mengganti resource seluruhnya | Tidak | Ya |
| PATCH | Mengubah sebagian resource | Tidak | Tidak selalu |
| DELETE | Menghapus resource | Tidak | Ya |

| Kode | Artinya | Dipakai saat |
|---|---|---|
| 200 | OK | Baca atau update berhasil |
| 201 | Created | POST berhasil membuat sesuatu |
| 400 | Bad Request | Client mengirim yang salah |
| 401 | Unauthorized | Tidak ada kredensial valid — siapa kamu? |
| 403 | Forbidden | Kredensial valid, tapi tidak berhak |
| 404 | Not Found | Resource tidak ada |
| 429 | Too Many Requests | Melewati batas rate limit — kalian buat sendiri di Minggu 8 |
| 500 | Internal Server Error | Kode kalian rusak. Tidak pernah dikirim dengan sengaja |

> **Aturan yang diulang sepanjang semester:** `4xx` artinya **client yang
> salah**, `5xx` artinya **kalian yang salah**. Service yang menjawab `200`
> dengan `{"error": "not found"}` di body itu berbohong pada setiap mesin
> yang memanggilnya — dan mesin, berbeda dari manusia, hanya membaca
> status line.

## 5. Materi: review JavaScript

Semua yang diasumsikan dikuasai oleh controller Minggu 2:

```js
// let vs const
let umur = 20;        // boleh di-reassign
const nama = "jojo";  // tidak boleh

// template literal
console.log(`Nama saya ${nama}, umur ${umur}`);

// arrow function
const tambah = (a, b) => a + b;

// destructuring — dipakai di SETIAP controller mulai Minggu 2
const orang = { nama: "giorno", umur: 100, jk: "L" };
const { nama: n, umur: u } = orang;

// default value untuk yang mungkin tidak ada
let jk = orang.jk || "Tidak Tahu";

// spread
const arr = [1, 2, 3];
const arrBaru = [...arr, 4];
```

## 6. Materi: array functions

Bagian yang paling penting. Controller buku Minggu 2 dibangun sepenuhnya
dari empat fungsi ini. Buat `latihan.js` dan jalankan dengan `node latihan.js`:

```js
let arr1 = [
  { nama: "jojo", umur: 40 },
  { nama: "giorno", umur: 100 },
  { nama: "jolyne", umur: 50 },
];

// map — transformasi setiap elemen, panjang output sama
const contohMap = arr1.map(
  (item) => `Nama saya : ${item.nama} berumur ${item.umur}`
);

// find — HANYA match pertama, atau undefined
const contohFind = arr1.find((item) => item.nama.includes("jo"));

// filter — semua match, selalu array
const hapusini = "giorno";
const contohFilter = arr1.filter((item) => item.nama !== hapusini);

// reduce — melipat array menjadi satu nilai
const contohReduce = arr1.reduce(
  (hasil, item) => (item.nama.length > hasil ? item.nama.length : hasil),
  0
);

// reduce yang mengembalikan objek, bukan angka
const palingTua = arr1.reduce(
  (palingtua, item) => (item.umur > palingtua.umur ? item : palingtua),
  { nama: "", umur: 0 }
);

console.log({ contohMap, contohFind, contohFilter, contohReduce, palingTua });
```

> **Bedakan `find` dan `filter` secara sadar.**
> `find` mengembalikan **objeknya atau `undefined`**. `filter` mengembalikan
> **array, mungkin kosong**. Mahasiswa sering tertukar, dan gejalanya selalu
> sama: `Cannot read property 'id' of undefined` di Minggu 2.

## 7. Materi: async/await — pandangan pertama

Cukup intuisinya saja minggu ini. Minggu 3 setiap panggilan database
asynchronous, dan saat itu konsep ini baru benar-benar masuk akal.

```js
// Sinkron: baris 2 menunggu baris 1
console.log("satu");
console.log("dua");

// Asynchronous: "tiga" tercetak TERAKHIR, walau ditulis kedua
console.log("satu");
setTimeout(() => console.log("tiga"), 1000);
console.log("dua");
```

```js
// Promise: nilai yang belum siap
const ambilData = () =>
  new Promise((resolve) => setTimeout(() => resolve("data siap"), 1000));

// async/await — gaya yang dipakai sepanjang semester
const main = async () => {
  console.log("mulai");
  const hasil = await ambilData();   // berhenti DI SINI sampai siap
  console.log(hasil);
};
main();
```

---

## Checklist akhir minggu

- [ ] Node, npm, npx terinstall dan terverifikasi.
- [ ] nodemon terinstall global.
- [ ] VS Code dengan extension yang direkomendasikan.
- [ ] Postman desktop terinstall, sudah login.
- [ ] Demo `w1` jalan di `http://localhost:3000`.
- [ ] `latihan.js` ditulis dan jalan — kelima hasilnya tercetak.

Tidak ada tugas yang dikumpulkan minggu ini. Bawa mesin yang siap ke
Minggu 2 — di sana project starter sudah menunggu.
