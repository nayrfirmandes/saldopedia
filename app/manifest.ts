import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Saldopedia - Jual Beli Cryptocurrency, PayPal & Skrill',
    short_name: 'Saldopedia',
    description: 'Platform jual beli cryptocurrency eceran, PayPal, dan Skrill mulai 25ribu rupiah. Transaksi mudah via WhatsApp atau form order online.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    lang: 'id',
    scope: '/',
    categories: ['finance', 'business'],
    icons: [
      {
        src: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/saldopedia-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
