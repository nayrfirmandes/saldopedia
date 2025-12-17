import "./css/style.css";
import { Providers } from "@/components/providers";
import LivechatWidget from "@/components/livechat-widget";
import localFont from "next/font/local";
import { cookies } from "next/headers";

const adobeClean = localFont({
  src: [
    {
      path: '../public/fonts/AdobeClean-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/AdobeClean-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/AdobeClean-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-adobe-clean',
  display: 'swap',
  preload: true,
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata = {
  metadataBase: new URL('https://saldopedia.com'),
  referrer: 'strict-origin-when-cross-origin',
  title: {
    default: "Saldopedia - Jual Beli Cryptocurrency, PayPal & Skrill",
    template: "%s | Saldopedia"
  },
  description: "Platform jual beli cryptocurrency eceran, PayPal, dan Skrill mulai 25ribu rupiah. Transaksi mudah via WhatsApp atau form order online. Mudah, cepat, dan aman.",
  keywords: [
    "jual beli cryptocurrency",
    "jual beli crypto",
    "jual beli bitcoin",
    "jual beli USDT",
    "jual beli ethereum",
    "jual beli PayPal",
    "jual beli Skrill",
    "crypto Indonesia",
    "cryptocurrency Indonesia",
    "PayPal Indonesia",
    "Skrill Indonesia",
    "Bitcoin Indonesia",
    "USDT Indonesia",
    "exchange crypto Indonesia",
    "tukar crypto",
    "jual crypto eceran",
    "beli crypto murah",
    "crypto terpercaya",
    "saldo PayPal murah",
    "saldo Skrill murah",
    "jual beli crypto online",
    "trading crypto Indonesia",
  ],
  authors: [{ name: "Saldopedia" }],
  creator: "Saldopedia",
  publisher: "Saldopedia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Saldopedia',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://saldopedia.com',
    siteName: 'Saldopedia',
    title: 'Saldopedia - Jual Beli Cryptocurrency, PayPal & Skrill',
    description: 'Platform jual beli cryptocurrency eceran, PayPal, dan Skrill mulai 25ribu rupiah. Transaksi mudah via WhatsApp atau form order online. Cepat dan aman.',
    images: [
      {
        url: '/images/saldopedia-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Saldopedia - Jual Beli Crypto, PayPal & Skrill Mulai 25 Ribu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saldopedia - Jual Beli Cryptocurrency, PayPal & Skrill',
    description: 'Platform jual beli cryptocurrency eceran, PayPal, dan Skrill mulai 25ribu rupiah. Transaksi mudah via WhatsApp atau form order online.',
    images: ['/images/saldopedia-og.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=3', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-16x16.png?v=3', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: [
      { url: '/apple-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.png?v=3', color: '#2563eb' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('language');
  const initialLanguage = (langCookie?.value === 'id' || langCookie?.value === 'en') ? langCookie.value : 'id';

  return (
    <html lang={initialLanguage} className={`scroll-smooth ${adobeClean.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var manualOverride = localStorage.getItem('theme-manual-override');
                  var isDark;
                  
                  if (manualOverride === 'true' && savedTheme) {
                    isDark = savedTheme === 'dark';
                  } else {
                    var hour = new Date().getHours();
                    isDark = hour < 6 || hour >= 18;
                  }
                  
                  var html = document.documentElement;
                  var bgColor = isDark ? '#111827' : '#f9fafb';
                  if (isDark) {
                    html.classList.add('dark');
                  } else {
                    html.classList.remove('dark');
                  }
                  html.style.backgroundColor = bgColor;
                  html.style.colorScheme = isDark ? 'dark' : 'light';
                  var meta = document.querySelector('meta[name="theme-color"]');
                  if (meta) meta.setAttribute('content', bgColor);
                  
                } catch(e) {}
              })()
            `,
          }}
        />
        <meta name="theme-color" content="#f9fafb" />
        <link rel="alternate" hrefLang="id" href="https://saldopedia.com" />
        <link rel="alternate" hrefLang="en" href="https://saldopedia.com" />
        <link rel="alternate" hrefLang="x-default" href="https://saldopedia.com" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=2" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png?v=2" />
        <link
          rel="preconnect"
          href="https://api.coingecko.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://api.coingecko.com"
        />
        <link
          rel="preload"
          href="/images/stripes.svg"
          as="image"
        />
        <link
          rel="preload"
          href="/images/stripes-dark.svg"
          as="image"
        />
        <link
          rel="preload"
          href="/images/avatar-01.jpg"
          as="image"
        />
        <link
          rel="preload"
          href="/images/avatar-02.jpg"
          as="image"
        />
        <link
          rel="preload"
          href="/images/avatar-03.jpg"
          as="image"
        />
      </head>
      <body
        className="bg-gray-50 font-inter tracking-tight text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100"
      >
        <Providers initialLanguage={initialLanguage}>
          <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
            {children}
          </div>
          <LivechatWidget />
        </Providers>
      </body>
    </html>
  );
}
