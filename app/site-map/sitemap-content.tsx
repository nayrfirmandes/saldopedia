'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

export default function SitemapContent() {
  const { t } = useLanguage()

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            {t('sitemapPage.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('sitemapPage.description')}{' '}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Saldopedia</span>
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {/* Services Column */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-6">
              {t('sitemapPage.services.title')}
            </h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/crypto" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.services.crypto')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/paypal" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.services.paypal')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/skrill" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.services.skrill')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.services.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features & Tools Column */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-6">
              {t('sitemapPage.features.title')}
            </h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/cryptocurrencies" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.features.cryptoList')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/calculator" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.features.calculator')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/customers" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.features.testimonials')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Content Column */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-6">
              {t('sitemapPage.content.title')}
            </h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/blog" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.content.blog')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/documentation" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.content.docs')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/support" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.content.support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-6">
              {t('sitemapPage.company.title')}
            </h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.company.about')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.company.terms')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.company.privacy')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookie-policy" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                >
                  {t('sitemapPage.company.cookie')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Link to XML Sitemap */}
        <div className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t('sitemapPage.xmlLink')}{' '}
            <Link 
              href="/sitemap.xml" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              sitemap.xml
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
