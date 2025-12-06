# Saldopedia - Cryptocurrency Buy & Sell Platform

## Overview
Saldopedia is a Next.js platform for buying and selling cryptocurrency, PayPal, and Skrill, specifically targeting the Indonesian market. It aims to capture a significant market share in the micro-cryptocurrency buy & sell segment with a minimum transaction of Rp 25,000. The platform provides marketing information, service details, testimonials, pricing, and crypto information, with transactions primarily facilitated via WhatsApp and an online order form.

## User Preferences
*   **Communication Style**: Simple, everyday language (bahasa sehari-hari).
*   **Design Aesthetic**: Minimalist dan elegant (tidak fancy gradients atau heavy shadows).
*   **Brand Requirement**: "Saldopedia" harus prominent dengan blue highlighting di seluruh halaman.
*   **Dark Mode**: Dim style (gray-900 base, bukan pure black) dengan high contrast for readability. Auto-switches based on user local time (06:00-18:00 light, 18:00-06:00 dark) with 1-minute polling interval and Visibility API for instant sync when tab is visible. Manual toggle available with localStorage persistence. Users can reset to auto mode using resetToAutoMode().
*   **Multilingual Support**: Indonesian (default) and English with a toggle switch in the footer, localStorage persistence for user preference.
*   **No Emoji**: Absolutely no emoji in system files (email templates, UI, code). Professional text only.
*   **Navigation Experience**: Smooth page transitions with a fullscreen loading overlay to cover flicker/flash during navigation.

## System Architecture

### Tech Stack
The platform is built on Next.js (App Router, SSR, Static Generation) with React and TypeScript. Styling uses Tailwind CSS (mobile-first), PayPal Sans custom fonts, and `@headlessui/react`. Data is stored in PostgreSQL (Neon-backed) and managed with Drizzle ORM. Content uses MDX with `rehype-pretty-code` and Shiki for syntax highlighting. Animations use AOS, date handling `date-fns`, and icons `lucide-react`.

### Database Schema
The database includes tables for `Users`, `Sessions`, `Orders`, `PasswordResetTokens`, `Transactions`, `Testimonials`, `NewsletterSubscribers`, and `Deposits` with appropriate relationships and constraints.

### Authentication & User Management
Authentication uses secure, HTTP-only cookie-based sessions. `AuthContext` manages user data, and a global `AutoLogout` component logs out inactive users. Email verification, password reset, and Google OAuth are supported.

### Saldo-Based Transaction System
All orders require user authentication. BUY orders deduct saldo atomically and are confirmed immediately. SELL orders credit saldo upon admin completion. The system supports Deposits (two-step process, min Rp 25,000, max Rp 5,000,000), Withdrawals (min Rp 50,000), and user-to-user Transfers (min Rp 10,000), all with atomic updates and row-level locking. Underpayment/overpayment handling with proportional crediting for partial payments is implemented.

### Rate Configuration
Saldopedia supports 19 cryptocurrencies, with market prices from CoinGecko API (3-minute cache). SELL orders use a 0.95 margin, BUY orders a 1.05 margin, and stablecoins have fixed rates. PayPal/Skrill rates are tiered. Dynamic minimum validation for crypto purchases is integrated with NOWPayments.

### UI/UX Features
The design system emphasizes a minimalist, flat design inspired by modern platforms, utilizing PayPal Sans fonts, a blue-centric color palette, and a dim dark mode. It features generous whitespace, subtle backgrounds, minimal borders, and color-coded transactions (green for incoming, red for outgoing). Reusable components, AOS, and Tailwind for animations are heavily used. All saldo displays show 2 decimal places for accuracy. Click-to-copy functionality is implemented for critical information.

### Performance & Security
Multi-layer caching (React `cache()`, localStorage) and context-aware loading skeletons ensure a smooth user experience. A fullscreen loading overlay masks page transitions. Security measures include `bcryptjs` for password hashing, cryptographically secure session tokens, HTTP-only/secure cookies, HMAC SHA512 for NOWPayments IPN verification, Drizzle ORM for SQL injection prevention, and React's automatic escaping for XSS. User IDs are random 7-digit numbers.

### System Automation
Crypto transactions are automated via NOWPayments. For SELL orders, IPN callbacks trigger automatic saldo crediting. For BUY orders, the NOWPayments Payout API handles automatic crypto disbursement with TOTP 2FA. Email notifications are sent to users and admins for various transaction states. Cronjobs are configured to check for expired orders and deposits (now 1-hour expiry).

### Documentation & SEO
Comprehensive MDX-based documentation covers all features. SEO is configured with a dynamic XML Sitemap, `robots.txt`, PWA Manifest, and JSON-LD structured data, with proper metadata for all public pages.

## External Dependencies

-   **Next.js**: Frontend framework.
-   **React**: UI library.
-   **TypeScript**: Programming language.
-   **PostgreSQL (Neon-backed)**: Database.
-   **Drizzle ORM**: ORM.
-   **bcryptjs**: Password hashing.
-   **jsonwebtoken**: Token generation/verification.
-   **Tailwind CSS**: Styling.
-   **@headlessui/react**: UI components.
-   **@next/mdx**: MDX integration.
-   **rehype-pretty-code & Shiki**: Syntax highlighting.
-   **AOS**: Scroll animations.
-   **date-fns**: Date utility.
-   **lucide-react**: Icons.
-   **CoinGecko API**: Cryptocurrency prices.
-   **WhatsApp Business**: Customer support.
-   **Brevo (Sendinblue)**: Transactional email.
-   **NOWPayments**: Cryptocurrency payment gateway and custody.
-   **Google OAuth**: Social login integration.