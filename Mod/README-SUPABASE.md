# Mod + Supabase

1. Buat project di [Supabase](https://supabase.com).
2. Buka **SQL Editor**, tempel isi `supabase-schema.sql`, lalu jalankan.
3. Buka **Project Settings → API** dan salin **Project URL** serta **anon public key**.
4. Isi `Mod/supabase-config.js`:
   - `MOD_SUPABASE_URL`
   - `MOD_SUPABASE_ANON_KEY`
5. Commit perubahan tersebut ke GitHub Pages.

`anon public key` memang boleh berada di frontend. Jangan pernah memasukkan `service_role key`.

Aplikasi akan tetap menampilkan mode demo lokal jika konfigurasi belum diisi. Setelah konfigurasi diisi, posting baru, metadata lampiran, preview media, dan tombol download akan tersedia untuk semua pengunjung melalui Supabase.
