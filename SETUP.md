# Saldopedia - Setup Guide

Panduan lengkap untuk menjalankan aplikasi Saldopedia di berbagai platform.

---

## Daftar Isi

1. [Persyaratan Sistem](#persyaratan-sistem)
2. [Quick Start](#quick-start)
3. [Setup Local Development](#setup-local-development)
4. [Setup di Replit](#setup-di-replit)
5. [Deploy ke Vercel](#deploy-ke-vercel)
6. [Environment Variables](#environment-variables)
7. [Setup External Services](#setup-external-services)
8. [Database](#database)
9. [Scripts](#scripts)
10. [Cronjobs](#cronjobs)
11. [Referral & Points System](#referral--points-system)
12. [Admin Panel](#admin-panel)
13. [Troubleshooting](#troubleshooting)

---

## Persyaratan Sistem

| Requirement | Version |
|-------------|---------|
| Node.js | >= 20.0.0 |
| npm | >= 10.0.0 |
| PostgreSQL | Neon (cloud) |

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/nayrfirmandes/saldopedia.git
cd saldopedia

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env dengan kredensial Anda
# Lihat bagian "Environment Variables" untuk detail

# 4. Install dependencies
npm install

# 5. Push schema ke database
npm run db:push

# 6. Jalankan development server
npm run dev
```

Server berjalan di `http://localhost:5000`

---

## Setup Local Development

### 1. Clone Repository

```bash
git clone https://github.com/nayrfirmandes/saldopedia.git
cd saldopedia
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit file `.env` dengan kredensial Anda (lihat bagian Environment Variables).

### 4. Setup Database

Buat database di [Neon](https://neon.tech/), lalu:

```bash
# Push schema ke database
npm run db:push

# (Opsional) Buka Drizzle Studio untuk lihat data
npm run db:studio
```

### 5. Jalankan Server

```bash
npm run dev
```

---

## Setup di Replit

### 1. Import dari GitHub

1. Login ke [Replit](https://replit.com)
2. Klik **Create Repl** > **Import from GitHub**
3. Paste URL: `https://github.com/nayrfirmandes/saldopedia`

### 2. Setup Environment

Buat file `.env` di root project:

```bash
cp .env.example .env
```

Edit `.env` dengan kredensial Anda.

> **PENTING:** Gunakan `APP_DATABASE_URL` (bukan `DATABASE_URL`) untuk menghindari konflik dengan Replit Secrets.

### 3. Install & Run

```bash
npm install
npm run db:push
npm run dev
```

---

## Deploy ke Vercel

### Metode 1: Via GitHub (Recommended)

1. **Push code ke GitHub:**
   ```bash
   git add .
   git commit -m "initial commit"
   git push origin main
   ```

2. **Connect ke Vercel:**
   - Login ke [Vercel](https://vercel.com)
   - Klik **Add New** > **Project**
   - Pilih repository GitHub
   - Klik **Import**

3. **Set Environment Variables:**
   - Di Vercel dashboard > **Settings** > **Environment Variables**
   - Tambahkan semua variables dari `.env`
   - Pastikan menambahkan untuk **Production**, **Preview**, dan **Development**

4. **Deploy:**
   - Vercel otomatis deploy saat connect
   - Setiap push ke `main` branch akan auto-deploy

### Metode 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (ikuti prompt)
vercel

# Deploy ke production
vercel --prod
```

### Konfigurasi Vercel

File `vercel.json` sudah dikonfigurasi dengan:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "regions": ["sin1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Update Deployment

Setelah ada perubahan code:

```bash
git add .
git commit -m "deskripsi perubahan"
git push origin main
```

Vercel akan auto-deploy dalam 1-2 menit.

---

## Environment Variables

### Variabel Wajib

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `APP_DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret untuk JWT token (min 32 char) | `openssl rand -base64 32` |
| `ORDER_COMPLETION_SECRET` | Secret untuk validasi order | `openssl rand -base64 32` |
| `CRON_SECRET` | Secret untuk scheduled jobs | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-xxx` |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v2 secret | `6Lxxx` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v2 site key | `6Lxxx` |
| `BREVO_API_KEY` | Brevo/Sendinblue API key | `xkeysib-xxx` |
| `CUSTOM_DOMAIN` | Domain utama | `saldopedia.com` |
| `NEXT_PUBLIC_APP_URL` | Full URL app | `https://saldopedia.com` |

### Variabel Opsional (Crypto Automation)

| Variable | Deskripsi |
|----------|-----------|
| `NOWPAYMENTS_API_KEY` | NOWPayments API key |
| `NOWPAYMENTS_IPN_SECRET` | IPN webhook secret |
| `NOWPAYMENTS_EMAIL` | Login email untuk payout |
| `NOWPAYMENTS_PASSWORD` | Login password |
| `NOWPAYMENTS_TOTP_SECRET` | 2FA TOTP secret |

### Generate Secret Keys

```bash
# Generate random 32-byte secret
openssl rand -base64 32
```

---

## Setup External Services

### 1. Neon Database

1. Daftar di [neon.tech](https://neon.tech/)
2. Buat project baru
3. Pilih region: **Asia Southeast (Singapore)** untuk latency terbaik
4. Copy connection string ke `APP_DATABASE_URL`

Format:
```
postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat/pilih project
3. Buka **APIs & Services** > **Credentials**
4. Klik **Create Credentials** > **OAuth client ID**
5. Pilih **Web application**

**Authorized JavaScript origins:**
```
https://yourdomain.com
https://your-app.vercel.app
http://localhost:5000
```

**Authorized redirect URIs:**
```
https://yourdomain.com/api/auth/google/callback
https://your-app.vercel.app/api/auth/google/callback
http://localhost:5000/api/auth/google/callback
```

### 3. Brevo (Email)

1. Daftar di [brevo.com](https://www.brevo.com/)
2. Buat API key di **Settings** > **SMTP & API**
3. Verifikasi sender email domain

### 4. reCAPTCHA v2

1. Buat di [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Pilih **reCAPTCHA v2** > "I'm not a robot"
3. Tambahkan semua domain (production, vercel, localhost)

### 5. NOWPayments (Opsional)

1. Daftar di [nowpayments.io](https://nowpayments.io/)
2. Buat API key di **Store Settings**
3. Set IPN callback URL: `https://yourdomain.com/api/nowpayments/ipn`
4. Untuk auto-payout: aktifkan 2FA dan copy TOTP secret

---

## Database

### Schema

Schema database ada di `shared/schema.ts`. Tabel utama:

- `users` - User accounts (termasuk role admin, referral_code, referred_by, points_balance)
- `sessions` - Login sessions
- `orders` - Buy/sell orders
- `deposits` - Deposit requests
- `withdrawals` - Withdrawal requests
- `transfers` - User-to-user transfers
- `transactions` - Transaction history
- `testimonials` - User testimonials
- `newsletter_subscribers` - Newsletter subscribers
- `password_reset_tokens` - Password reset tokens
- `point_transactions` - Riwayat poin (referral bonus, redemption, etc)
- `referrals` - Data referral (referrer, referred user, bonus status)
- `rate_settings` - Dynamic rate settings (crypto margins, PayPal/Skrill tiers)
- `transaction_security_logs` - Security audit trail for transfers/withdrawals
- `phone_verification_codes` - OTP codes untuk verifikasi nomor HP via WhatsApp

### Commands

```bash
# Push schema ke database (development)
npm run db:push

# Buka Drizzle Studio (GUI)
npm run db:studio

# Seed data awal (opsional)
npm run db:seed
```

---

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan development server (port 5000) |
| `npm run build` | Build untuk production |
| `npm start` | Jalankan production server |
| `npm run lint` | Cek linting errors |
| `npm run db:push` | Push schema ke database |
| `npm run db:studio` | Buka Drizzle Studio |
| `npm run db:seed` | Seed data awal |

---

## Cronjobs

Setup cronjobs di [cron-job.org](https://cron-job.org) atau service serupa:

| Endpoint | Method | Interval | Header | Fungsi |
|----------|--------|----------|--------|--------|
| `/api/orders/check-expired` | POST | 10 menit | `x-cron-secret: {CRON_SECRET}` | Expire pending orders |
| `/api/deposits/check-expired` | POST | 10 menit | `x-cron-secret: {CRON_SECRET}` | Expire pending deposits |

---

## Referral & Points System

### Overview

Sistem referral memberikan bonus poin kepada referrer dan referred user:

| Bonus | Jumlah |
|-------|--------|
| Referrer (yang mengajak) | 17.000 poin |
| Referred (yang diajak) | 27.000 poin |

### Format Kode Referral

- 4 huruf pertama dari nama + 4 digit dari user ID
- Contoh: User "Budi Santoso" dengan ID 1234567 = `BUDI4567`
- Jika duplikat, ditambah suffix random

### Penukaran Poin

- Minimum: 100.000 poin
- Rate: 10.000 poin = Rp 5.000
- Poin ditukar ke saldo user secara atomik

### Files Terkait

- `lib/referral.ts` - Logika referral code generation & bonus
- `lib/points.ts` - Logika poin (history, redemption)
- `app/api/points/redeem/route.ts` - API redeem poin
- `app/(dashboard)/dashboard/referral/` - Halaman referral
- `app/(dashboard)/dashboard/points/` - Halaman poin

---

## Transaction Security

### PayPal-Level Security Features

Platform menggunakan sistem keamanan berlapis untuk transfer dan withdrawal:

| Fitur | Deskripsi |
|-------|-----------|
| Browser Fingerprinting | Deteksi perangkat baru (7 hari cooldown) |
| Geolocation Tracking | Deteksi lokasi login user |
| Impossible Travel Detection | Block jika login dari lokasi berbeda terlalu cepat |
| Rate Limiting | Max 5 transfer/withdrawal per jam |
| Multi-IP Detection | Block jika 3+ IP berbeda dalam 24 jam |
| VPN Detection | Block transfer dari VPN/proxy |
| Risk Delay | Delay progresif berdasarkan risk score |

### Reset Times

- Rate limit: 1 jam
- Multi-IP limit: 24 jam
- Browser fingerprint: 7 hari
- VPN/Impossible travel: Segera (blokir permanen)

### Files Terkait

- `lib/security/transaction-security.ts` - Logic utama security
- `lib/security/browser-fingerprint.ts` - Fingerprint extraction
- `lib/security/geolocation.ts` - Geolocation & VPN detection
- `hooks/use-browser-fingerprint.ts` - React hook untuk client

---

## Phone Verification

### Overview

User harus verifikasi nomor HP untuk bisa redeem poin. OTP dikirim via WhatsApp menggunakan Fonnte.

### Flow

1. User input nomor HP di halaman Settings
2. Sistem kirim OTP 6 digit via WhatsApp
3. User input OTP untuk verifikasi
4. Jika sukses, `is_phone_verified = true`

### Environment Variable

```bash
FONNTE_TOKEN=xxx  # API token dari fonnte.com
```

### Files Terkait

- `lib/phone-verification.ts` - Logic kirim OTP
- `app/api/user/phone/` - API endpoints (send/verify)
- `app/(dashboard)/dashboard/settings/` - UI verifikasi HP

---

## Admin Panel

### Akses Admin

1. Update kolom `role` di tabel `users` menjadi `'admin'`
2. Bisa via Neon Dashboard atau SQL:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   ```
3. Admin menu otomatis muncul di header setelah login

### Fitur Admin

- `/admin/transactions` - Kelola pending deposits, withdrawals, orders
- `/admin/points` - Kelola poin user (adjustment manual, statistik)
- `/admin/rates` - Kelola rate dinamis (crypto margin, PayPal/Skrill tiers)
- Confirm/Complete transaksi dengan saldo crediting
- Reject transaksi dengan notifikasi ke user
- HMAC token validation untuk keamanan

### Dynamic Rate Management

Rate dapat diubah secara real-time tanpa redeploy melalui `/admin/rates`:

**Crypto Settings:**
- Sell margin (default: 0.95 = -5% dari harga pasar)
- Buy margin (default: 1.05 = +5% dari harga pasar)
- Stablecoin fixed rates (USDT/USDC) untuk jual dan beli

**PayPal/Skrill Settings:**
- 4-tier rate structure berdasarkan jumlah USD
- Tier terpisah untuk sell (convert) dan buy (topup)
- Setiap tier: min USD, max USD, rate (IDR/USD)

**Cara Kerja:**
1. Admin ubah rate di `/admin/rates`
2. Rate tersimpan ke tabel `rate_settings`
3. Semua halaman user otomatis tampil rate baru (cache 60 detik)
4. Tidak perlu redeploy atau restart server

**API Endpoints:**
- `GET /api/rates` - Public endpoint untuk fetch rates
- `GET /api/admin/rates` - Admin: fetch all settings
- `PUT /api/admin/rates` - Admin: update individual setting

---

## Troubleshooting

### Error: "APP_DATABASE_URL must be set"
- Pastikan `APP_DATABASE_URL` sudah diset di `.env`
- Jangan gunakan `DATABASE_URL` (bisa konflik dengan platform secrets)

### Error: "JWT_SECRET is not configured"
- Set `JWT_SECRET` dengan minimal 32 karakter
- Generate: `openssl rand -base64 32`

### Google OAuth: "redirect_uri_mismatch"
- Pastikan redirect URI sama persis di Google Cloud Console
- Format: `https://domain.com/api/auth/google/callback`
- Tidak boleh ada trailing slash

### Build Error: Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database connection error
- Cek format `APP_DATABASE_URL` sudah benar
- Pastikan ada `?sslmode=require`
- Verify di Neon dashboard bahwa database aktif

### Vercel deployment gagal
1. Cek build logs di Vercel dashboard
2. Pastikan semua env vars sudah diset
3. Coba build locally: `npm run build`

---

## Struktur Project

```
saldopedia/
├── app/                  # Next.js App Router pages & API
│   ├── (default)/        # Public pages
│   ├── api/              # API routes
│   └── dashboard/        # Protected dashboard pages
├── components/           # React components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
├── locales/              # i18n translations
├── public/               # Static assets
├── scripts/              # Utility scripts
├── server/               # Server-side logic
├── shared/               # Shared code (schema, types)
├── utils/                # Helper utilities
├── .env.example          # Environment template
├── drizzle.config.ts     # Drizzle ORM config
├── next.config.js        # Next.js config
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind CSS config
├── tsconfig.json         # TypeScript config
└── vercel.json           # Vercel deployment config
```

---

## Checklist Deployment

- [ ] Clone/fork repository
- [ ] Setup Neon database
- [ ] Setup Google OAuth credentials
- [ ] Setup Brevo email service
- [ ] Setup reCAPTCHA
- [ ] Setup NOWPayments (opsional)
- [ ] Copy `.env.example` ke `.env`
- [ ] Isi semua environment variables
- [ ] Run `npm install`
- [ ] Run `npm run db:push`
- [ ] Test locally dengan `npm run dev`
- [ ] Deploy ke Vercel
- [ ] Set environment variables di Vercel
- [ ] Setup cronjobs
- [ ] Test production deployment

---

## Kontak

- WhatsApp: 08119666620
- Website: https://saldopedia.com

---

*Last updated: December 2025*
