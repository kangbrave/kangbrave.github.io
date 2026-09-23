# Brave Blog deployment

## Public URL

The repository contains a `CNAME` file for `blog.kangbrave.github.io`. In GitHub, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then enable HTTPS after DNS has propagated.

For the DNS provider, create:

```text
Type: CNAME
Name: blog
Target: kangbrave.github.io
```

## Shared publishing

GitHub Pages serves the front end publicly, but it does not provide a database. The current front end keeps draft/demo posts in each browser's `localStorage`; that is intentionally not treated as shared storage.

The repository already contains a Supabase project configuration under `Mod/`. Before enabling cross-device publishing, configure the Supabase database and storage policies:

- `posts`: public `SELECT`; authenticated admin `INSERT`, `UPDATE`, and `DELETE`
- `post_files`: public `SELECT`; authenticated admin `INSERT` and `DELETE`
- storage bucket `mod-files`: public read; authenticated admin upload/delete
- enable Supabase Auth for the admin area

Do not add a Supabase service-role or secret key to this repository. Only a publishable/anon key may be used in browser code, and RLS must remain enabled.
