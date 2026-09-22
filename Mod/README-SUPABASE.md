# Mod + Supabase

Mod adalah halaman statis GitHub Pages yang memakai Supabase untuk posting publik dan lampiran.

## Setup satu kali

1. Buka project Supabase: `https://cpseqxlarjjfsvnqxxzk.supabase.co`.
2. Buka **SQL Editor**.
3. Jalankan seluruh isi `supabase-schema.sql`. Script ini aman dijalankan ulang.
4. Pastikan bucket `mod-files` berstatus **Public**.
5. Buka `https://kangbrave.github.io/Mod/`.

## Fitur publik

- Semua pengunjung dapat membaca posting dari tabel `posts`.
- Semua pengunjung dapat membuka detail melalui tombol **Selengkapnya**.
- Lampiran disimpan di bucket `mod-files`.
- Gambar dan video mendapat preview.
- Setiap lampiran memiliki link download.
- Form mendukung maksimum 8 file, masing-masing maksimum 100 MB.

## Konfigurasi browser

`supabase-config.js` hanya berisi Project URL dan publishable key. Keduanya memang dapat digunakan pada frontend. Jangan menambahkan secret key ke file ini.

## Keamanan dan batasan

Policy insert publik berarti siapa pun dapat membuat posting. Untuk produksi yang lebih aman, aktifkan Supabase Auth dan pindahkan upload/publish ke Edge Function atau backend yang melakukan validasi ukuran, tipe file, rate limit, dan moderasi.

GitHub Pages tidak menjalankan Node.js. Karena itu `@supabase/server` hanya boleh dipasang pada project backend/Edge Function:

```bash
npm install @supabase/server
```

Variabel rahasia harus disimpan di environment backend, bukan repository:

```env
SUPABASE_URL=https://cpseqxlarjjfsvnqxxzk.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_JWKS_URL=https://cpseqxlarjjfsvnqxxzk.supabase.co/auth/v1/.well-known/jwks.json
```

Jangan commit `.env` atau `SUPABASE_SECRET_KEY`.
