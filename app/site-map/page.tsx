import { Metadata } from 'next'
import SitemapContent from './sitemap-content'

export const metadata: Metadata = {
  title: 'Sitemap - Saldopedia',
  description: 'Peta situs lengkap Saldopedia - platform jual beli cryptocurrency, PayPal, dan Skrill terpercaya di Indonesia.',
}

export default function SitemapPage() {
  return <SitemapContent />
}
