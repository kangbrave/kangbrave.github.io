# Mod + Supabase

## Konfigurasi yang sudah dipasang

`Mod/supabase-config.js` sudah dikonfigurasi menggunakan:

- Project URL: `https://cpseqxlarjjfsvnqxxzk.supabase.co`
- Publishable key: key publik yang aman digunakan di browser

**Jangan pernah menambahkan `SUPABASE_SECRET_KEY` ke file frontend, GitHub Pages, atau repository publik.** Secret key hanya boleh digunakan pada backend/server atau Edge Function.

## Setup database dan storage

1. Buka project Supabase.
2. Buka **SQL Editor**.
3. Jalankan isi `supabase-schema.sql`.
4. Pastikan bucket Storage `mod-files` sudah dibuat sebagai bucket publik.
5. Buka `https://kangbrave.github.io/Mod/`.

Aplikasi menggunakan Supabase JS di browser untuk membaca posting, mengunggah lampiran, menampilkan preview media, dan menyediakan tombol download publik.

## Catatan backend

Repository ini adalah GitHub Pages statis, jadi tidak memiliki runtime Node/backend. Karena itu `@supabase/server` dan `SUPABASE_SECRET_KEY` **tidak** boleh dipasang di halaman frontend. Jika nanti diperlukan API server untuk autentikasi, validasi upload, atau operasi administratif, buat backend/Edge Function terpisah dan simpan variabel berikut hanya di environment backend:

```env
SUPABASE_URL=https://cpseqxlarjjfsvnqxxzk.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_JWKS_URL=https://cpseqxlarjjfsvnqxxzk.supabase.co/auth/v1/.well-known/jwks.json
```

Instalasi server dilakukan hanya di project backend:

```bash
npm install @supabase/server
```

Jangan commit file `.env` atau secret key ke repository.
