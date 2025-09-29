### Environment Setup

Aplikasi ini menggunakan konfigurasi berbasis file `.env`.
File `.env` **tidak dibagikan di repository** karena berisi informasi sensitif (database, API key, email, dll).

Untuk menjalankan aplikasi:

1. Salin file contoh:

   ```bash
   cp .env.example .env
   ```
2. Edit file `.env` sesuai dengan konfigurasi lokal kamu:

   * Database (MySQL/Postgres)
   * Supabase (URL & API key)
   * IP Frontend/Backend
   * Email SMTP (jika ingin mengaktifkan notifikasi email)

Contoh isi `.env` ada di file `.env.example`.
