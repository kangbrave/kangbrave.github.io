# Admin authentication setup

The admin console is protected by Supabase Auth and an `admin_users` allowlist. A password is never stored in this repository.

1. In Supabase Auth, create the administrator user with email/password.
2. Run `supabase/admin-auth.sql` in the Supabase SQL Editor.
3. Copy the user's UUID from **Authentication → Users** and insert it into `public.admin_users` using the SQL comment in that file.
4. Deploy the site and sign in through **Menu Admin**.

The browser checks the current Supabase session and the allowlist row before opening the admin console. RLS protects the allowlist. Do not replace this with a password hard-coded in JavaScript.

Important: the current application stores posts in `localStorage`, so post data is browser-local. For shared, tamper-resistant content, move posts and media to Supabase tables/storage and apply matching admin-only INSERT/UPDATE/DELETE RLS policies.
