# Saldopedia - Setup Guide untuk Tim

Panduan lengkap untuk menjalankan aplikasi Saldopedia di akun Replit baru.

> **PENTING:** Aplikasi ini menggunakan `APP_DATABASE_URL` (bukan `DATABASE_URL`) untuk menghindari konflik dengan Replit Secrets yang otomatis meng-override environment variables.

## Quick Start (5 Menit)

```bash
# 1. Clone/Fork repository
# 2. Copy environment file
cp .env.example .env

# 3. Edit .env dengan kredensial Anda
nano .env  # atau edit manual

# 4. Install semua dependencies
npm install

# 5. Push schema ke database
npm run db:push

# 6. Jalankan development server
npm run dev
```

## Checklist Setup

- [ ] Fork repository dari GitHub
- [ ] Import ke Replit
- [ ] Buat database di Neon
- [ ] Setup Google OAuth di Google Cloud Console
- [ ] Setup Brevo untuk email
- [ ] Setup reCAPTCHA
- [ ] Setup NOWPayments (opsional)
- [ ] Konfigurasi semua environment variables
- [ ] Push schema ke database
- [ ] Test login dengan Google
- [ ] Test login dengan email/password
- [ ] Deploy ke Vercel

---

## Persyaratan Sistem

- **Node.js**: >= 20.0.0
- **Database**: Neon PostgreSQL (eksternal)
- **Platform**: Replit + Vercel
- **Version Control**: GitHub

---

## Langkah 1: Fork Repository di GitHub

1. Buka repository: `https://github.com/nayrfirmandes/saldopedia`
2. Klik tombol **Fork** di kanan atas
3. Repository akan ter-copy ke akun GitHub Anda

---

## Langkah 2: Import ke Replit

1. Login ke Replit
2. Klik **Create Repl** > **Import from GitHub**
3. Paste URL repository yang sudah di-fork
4. Tunggu proses import selesai

---

## Langkah 3: Buat Database di Neon

1. Daftar/Login di https://neon.tech/
2. Klik **New Project**
3. Pilih region: **Asia Southeast (Singapore)** untuk latency terbaik
4. Buat project dan copy **Connection String**

Format connection string:
```
postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

---

## Langkah 4: Setup Environment Variables

Buat file `.env` di root project (copy dari `.env.example`):

```bash
cp .env.example .env
```

Lalu edit dengan kredensial Anda:

```env
# ============================================
# DATABASE - NEON (WAJIB)
# Gunakan APP_DATABASE_URL, bukan DATABASE_URL
# ============================================
APP_DATABASE_URL=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# ============================================
# SECURITY SECRETS (WAJIB - min 32 karakter)
# ============================================
JWT_SECRET=your-jwt-secret-key-minimum-32-characters-long
ORDER_COMPLETION_SECRET=your-order-completion-secret-min-32-chars
CRON_SECRET=your-cron-secret-key-here

# ============================================
# EMAIL SERVICE - BREVO (WAJIB)
# ============================================
BREVO_API_KEY=xkeysib-your-brevo-api-key-here

# ============================================
# RECAPTCHA (WAJIB)
# ============================================
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# ============================================
# GOOGLE OAUTH (WAJIB untuk login Google)
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============================================
# DOMAIN CONFIG
# ============================================
CUSTOM_DOMAIN=yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# ============================================
# ADMIN CONFIG
# ============================================
ADMIN_NOTIFICATION_EMAIL=admin@example.com
ADMIN_PAYPAL_EMAIL=admin-paypal@example.com
ADMIN_SKRILL_EMAIL=admin-skrill@example.com

# ============================================
# NOWPAYMENTS - CRYPTO AUTOMATION (OPSIONAL)
# ============================================
NOWPAYMENTS_API_KEY=your-nowpayments-api-key
NOWPAYMENTS_IPN_SECRET=your-ipn-secret

# Untuk auto-payout (BUY orders) - butuh 2FA
NOWPAYMENTS_EMAIL=your-login-email
NOWPAYMENTS_PASSWORD=your-login-password
NOWPAYMENTS_TOTP_SECRET=your-totp-secret
```

---

## Langkah 5: Install Dependencies

```bash
npm install
```

---

## Langkah 6: Push Schema ke Database

```bash
npm run db:push
```

Ini akan membuat semua tabel di Neon database.

---

## Langkah 7: Jalankan Development Server

```bash
npm run dev
```

Server berjalan di `http://localhost:5000`

---

## Deploy ke Vercel via GitHub

### Setup Awal (Sekali)

1. **Connect Vercel ke GitHub:**
   - Login ke https://vercel.com
   - Klik **Add New** > **Project**
   - Pilih repository yang sudah di-fork
   - Klik **Import**

2. **Set Environment Variables di Vercel:**
   - Di Vercel dashboard, buka **Settings** > **Environment Variables**
   - Tambahkan semua variables dari file `.env`

3. **Deploy:**
   - Vercel akan otomatis deploy saat pertama kali connect

### Deploy Update (Setiap Ada Perubahan)

Setelah edit code di Replit, push ke GitHub:

```bash
# Cek status perubahan
git status

# Tambahkan semua perubahan
git add .

# Commit dengan pesan
git commit -m "pesan perubahan"

# Push ke GitHub (akan auto-deploy ke Vercel)
git push origin main
```

**Shortcut command:**
```bash
git add . && git commit -m "update" && git push origin main
```

---

## Scripts Tersedia

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production |
| `npm start` | Jalankan production server |
| `npm run db:push` | Push schema ke database |
| `npm run db:studio` | Buka Drizzle Studio (DB GUI) |

---

## Generate Secret Keys

Gunakan command ini untuk generate random secret:

```bash
openssl rand -base64 32
```

Atau gunakan online: https://randomkeygen.com/

---

## Setup External Services

### 1. Neon Database

1. Daftar di https://neon.tech/
2. Buat project baru
3. Pilih region: **Asia Southeast (Singapore)**
4. Copy connection string ke `APP_DATABASE_URL`

### 2. Google OAuth (Login dengan Google)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Buka **APIs & Services** > **Credentials**
4. Klik **Create Credentials** > **OAuth client ID**
5. Pilih **Web application**
6. Beri nama: `Saldopedia Web`
7. **Authorized JavaScript origins:**
   ```
   https://yourdomain.com
   https://your-replit-url.replit.dev
   ```
8. **Authorized redirect URIs:**
   ```
   https://yourdomain.com/api/auth/google/callback
   https://your-replit-url.replit.dev/api/auth/google/callback
   ```
9. Klik **Create**
10. Copy **Client ID** dan **Client Secret** ke `.env`

> **PENTING:** Redirect URI harus sama persis dengan yang didaftarkan di Google Cloud Console. Jika berbeda, login Google akan error.

### 3. Brevo (Email)

1. Daftar di https://www.brevo.com/
2. Buat API key di Settings > SMTP & API
3. Verifikasi sender email: `service.transaksi@saldopedia.com`
4. Verifikasi domain jika menggunakan custom domain
5. Set `BREVO_API_KEY`

### 4. reCAPTCHA v2

1. Buat di https://www.google.com/recaptcha/admin
2. Pilih reCAPTCHA v2 "I'm not a robot"
3. Tambahkan domain (termasuk *.replit.dev dan vercel domain)
4. Set kedua keys ke `.env`

### 5. NOWPayments (Crypto Automation)

1. Daftar di https://nowpayments.io/
2. Buka **Store Settings** > **API Keys**
3. Copy `API Key` ke `NOWPAYMENTS_API_KEY`
4. Set IPN Secret di dashboard, copy ke `NOWPAYMENTS_IPN_SECRET`

**Untuk Auto-Payout (BUY orders):**
5. Aktifkan 2FA di akun NOWPayments
6. Gunakan authenticator app (Google Authenticator/Authy)
7. Copy TOTP secret key ke `NOWPAYMENTS_TOTP_SECRET`
8. Set email & password login ke env vars

---

## Troubleshooting

### Error: "APP_DATABASE_URL must be set"
- Pastikan `APP_DATABASE_URL` sudah diset di `.env`
- Jangan gunakan `DATABASE_URL` karena bisa konflik dengan Replit Secrets

### Error: "ORDER_COMPLETION_SECRET is required"
- Set secret minimal 32 karakter

### Google OAuth Error: "redirect_uri_mismatch"
- Pastikan redirect URI di Google Cloud Console sama persis dengan domain app
- Format: `https://yourdomain.com/api/auth/google/callback`
- Cek tidak ada trailing slash atau typo

### Google OAuth Error: "invalid_client"
- Cek `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` sudah benar
- Pastikan tidak ada spasi atau karakter tambahan

### Login Google berhasil tapi redirect ke login lagi
- Pastikan `NEXT_PUBLIC_APP_URL` sama dengan domain production
- Cek cookie `saldopedia_session` sudah ter-set di browser

### Git push rejected
```bash
git pull origin main --rebase
git push origin main
```

### Build fails
```bash
npm run build
```
Cek error message dan fix sesuai petunjuk.

### Database connection error
- Cek `APP_DATABASE_URL` format sudah benar
- Pastikan `?sslmode=require` ada di connection string
- Coba akses database dari Neon dashboard untuk verify

---

## Struktur Environment

```
Replit (Development)
    ↓ git push
GitHub (Repository)
    ↓ auto-deploy
Vercel (Production)
    ↓ connects to
Neon (Database)
```

---

## Fitur Autentikasi

### Login Email/Password
1. User daftar dengan email
2. Verifikasi email (link dikirim ke email)
3. Login dengan email + password
4. Akses dashboard

### Login Google OAuth
1. Klik "Login dengan Google"
2. Pilih akun Google
3. Consent screen
4. Redirect ke dashboard

### Google User Set Password
User yang login dengan Google bisa set password di Settings:
1. Buka `/dashboard/settings`
2. Scroll ke bagian "Atur Password"
3. Masukkan password baru + konfirmasi
4. Sekarang bisa login dengan Google ATAU email/password

---

## Cronjobs Eksternal

Setup cronjobs di [cron-job.org](https://cron-job.org) atau service serupa:

| Endpoint | Interval | Fungsi |
|----------|----------|--------|
| `https://yourdomain.com/api/orders/check-expired` | 10 menit | Expire order pending |
| `https://yourdomain.com/api/deposits/check-expired` | 10 menit | Expire deposit pending |

---

## Kontak Support

- WhatsApp: 08119666620
- Website: https://saldopedia.com

---

*Last updated: 6 Desember 2025*
