# Saldopedia - Cryptocurrency Buy & Sell Platform

## Overview
Saldopedia is a Next.js platform designed for buying and selling cryptocurrency, PayPal, and Skrill, specifically targeting the Indonesian micro-transaction market (minimum Rp 25,000). The platform aims to provide a comprehensive service with marketing information, service details, testimonials, pricing, and crypto information. Transactions are primarily managed via WhatsApp and an online order form.

## User Preferences
*   **Communication Style**: Simple, everyday language (bahasa sehari-hari).
*   **Design Aesthetic**: Minimalist dan elegant (tidak fancy gradients atau heavy shadows).
*   **Brand Requirement**: "Saldopedia" harus prominent dengan blue highlighting di seluruh halaman.
*   **Dark Mode**: Dim style (gray-900 base, bukan pure black) dengan high contrast for readability. Auto-switches based on user local time (06:00-18:00 light, 18:00-06:00 dark) with 1-minute polling interval and Visibility API for instant sync when tab is visible. Manual toggle available with localStorage persistence. Users can reset to auto mode using resetToAutoMode().
*   **Multilingual Support**: Indonesian (default) and English with a toggle switch in the footer, localStorage persistence for user preference.
*   **No Emoji**: Absolutely no emoji in system files (email templates, UI, code). Professional text only.
*   **Navigation Experience**: Smooth page transitions with a fullscreen loading overlay to cover flicker/flash during navigation.

## System Architecture

### UI/UX Decisions
The platform features a minimalist, flat design with a blue-centric color palette, utilizing PayPal Sans fonts and a dim dark mode. It prioritizes generous whitespace, subtle backgrounds, minimal borders, and color-coded transactions (green for incoming, red for outgoing). Reusable components and Tailwind CSS for mobile-first styling are central to the design system. Saldo displays are always shown with two decimal places, and critical information includes click-to-copy functionality.

### Telegram-Style Animation System (December 2025)
A comprehensive animation system inspired by Telegram's buttery-smooth UI is implemented in `app/css/additional-styles/telegram-animations.css`:
- **Spring Physics Easing**: Custom cubic-bezier curves for natural, bouncy animations (`--ease-spring`, `--ease-spring-soft`, `--ease-spring-out`)
- **Button Animations**: Press/hover effects with scale transforms (hover: 1.02x, active: 0.97x)
- **Card Animations**: Lift effect on hover with enhanced shadows (`card-telegram`, `hover-lift`)
- **Dropdown/Modal Animations**: Smooth slide + fade with spring easing (`dropdown-telegram`)
- **Page Transitions**: Fade-in from bottom for page enters (`page-enter`)
- **Form Input Focus**: Subtle glow effect on focus (3px blue shadow)
- **Skeleton Loading**: Smooth shimmer animation for loading states
- **Reduced Motion Support**: Respects `prefers-reduced-motion` for accessibility
- **GPU Acceleration**: Uses `translateZ(0)` and `will-change` for 60fps performance

### Technical Implementations
Built with Next.js (App Router, SSR, Static Generation), React, and TypeScript. Data persistence uses PostgreSQL (Neon-backed) and Drizzle ORM. Content is managed with MDX, enhanced by `rehype-pretty-code` and Shiki for syntax highlighting. Authentication uses secure, HTTP-only cookie-based sessions, supporting email verification, password reset, and Google OAuth. A saldo-based transaction system supports atomic BUY, SELL, Deposit, Withdrawal, and Transfer operations with row-level locking. Rate configurations for 19 cryptocurrencies are dynamically managed via CoinGecko API, with fixed rates for stablecoins and tiered rates for PayPal/Skrill. Network fees are transparently displayed and factored into BUY orders. Performance is optimized with multi-layer caching and context-aware loading skeletons, while security includes `bcryptjs` for password hashing, cryptographically secure session tokens, and HMAC SHA512 for IPN verification. Transaction security includes IP tracking, device fingerprinting, rate limiting, and risk-based delays.

### Feature Specifications
- **User Management**: Secure authentication, email verification, password reset, Google OAuth, and automatic logout for inactive users.
- **Saldo System**: Atomic transactions for buying, selling, depositing (min Rp 25,000), withdrawing (min Rp 50,000), and user-to-user transfers (min Rp 10,000). Handles underpayment/overpayment.
- **Dynamic Rates**: Configurable buy/sell margins for cryptocurrencies, fixed rates for stablecoins, and tiered rates for PayPal/Skrill, fetching market data from CoinGecko.
- **Admin Panels**: Dedicated interfaces for managing pending transactions (Deposits, Withdrawals, Orders, Transfers - Confirm/Reject), user points (adjustments, statistics, leaderboards), and dynamic rate settings (Crypto, PayPal, Skrill). Admin access is role-based and secured with HMAC-SHA256 token validation. Transfer history shows sender/receiver details, amount, notes, and timestamp.
- **Automation**: NOWPayments integration for automated crypto transactions (payouts for BUY, IPN for SELL), email notifications, and cronjobs for expired order management.
- **Transparency**: Clear display of blockchain network fees in IDR for crypto transactions, separated from the crypto price in order forms.
- **Blog System**: MDX-based blog with specific frontmatter and styling conventions, emphasizing internal linking and SEO.
- **Points System**: Users earn points (referrer/referred bonuses) that can be redeemed for saldo at a fixed rate, with minimum redemption limits. Point redemption requires both email and phone number verification.
- **Phone Verification**: OTP-based phone verification via Fonnte WhatsApp. Users verify phone in settings page before redeeming points.

### System Design Choices
- **Component Architecture**: Optimized server/client component split pattern for Next.js, rendering static HTML on the server and handling interactivity/translations on the client.
- **Security**: Robust measures including `bcryptjs`, secure session tokens, HTTP-only cookies, HMAC validation, Drizzle ORM for SQL injection prevention, XSS protection, and comprehensive transaction security.
- **Hydration Safety**: Components that use localStorage or browser APIs (auth-context, language-toggle, newsletter-form) are designed to prevent SSR/client hydration mismatches by deferring client-specific rendering until after hydration completes using isHydrated flags.
- **Performance**: Multi-layer caching, loading skeletons, and fullscreen loading overlays for smooth user experience.
- **SEO**: Dynamic XML Sitemap, `robots.txt`, PWA Manifest, and JSON-LD structured data for improved search engine visibility.

## External Dependencies

-   **Next.js**: Frontend framework.
-   **React**: UI library.
-   **TypeScript**: Programming language.
-   **PostgreSQL (Neon-backed)**: Database.
-   **Drizzle ORM**: ORM.
-   **bcryptjs**: Password hashing.
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
-   **AI Livechat + Telegram**: Custom livechat with AI assistant (OpenAI via Replit AI Integrations) and Telegram admin integration.
-   **Fonnte**: WhatsApp OTP for phone verification (Indonesian provider).

## Documentation (content/docs/)

The documentation folder contains comprehensive guides in Indonesian:

- **memulai.mdx**: Getting started guide
- **cryptocurrency.mdx**: Crypto transactions with network fee info
- **akun-registrasi.mdx**: Account registration including Google OAuth
- **dashboard-saldo.mdx**: Dashboard and balance management
- **deposit.mdx**: Deposit/top-up guide
- **withdraw.mdx**: Withdrawal guide
- **transfer-saldo.mdx**: User-to-user transfer guide
- **poin-referral.mdx**: Points & referral system with phone verification
- **keamanan.mdx**: Security features
- **kalkulator.mdx**: Rate calculator guide
- **live-chat.mdx**: Customer support channels with AI-powered livechat and Telegram admin integration