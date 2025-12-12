'use client';

import { memo } from "react";
import Link from "next/link";
import Logo from "./logo";
import NewsletterForm from "../newsletter-form";
import LanguageToggle from "../language-toggle";
import SystemStatus from "../system-status";
import { useLanguage } from "@/contexts/language-context";

function Footer({ border = false }: { border?: boolean }) {
  const { t } = useLanguage();
  return (
    <footer className="will-change-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top area: Blocks */}
        <div
          className={`grid grid-cols-2 gap-8 py-8 md:grid-cols-12 md:gap-10 md:py-12 ${border ? "border-t [border-image:linear-gradient(to_right,transparent,var(--color-slate-200),transparent)1]" : ""}`}
        >
          {/* 1st block - Logo & Copyright */}
          <div className="space-y-2 col-span-2 md:col-span-2">
            <div>
              <Logo />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {t('footer.copyright')}
            </div>
            <div className="pt-3">
              <LanguageToggle />
            </div>
          </div>

          {/* 2nd block - Product */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <h3 className="text-base font-semibold dark:text-gray-100">{t('footer.product')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/crypto"
                >
                  {t('footer.cryptoBuy')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/paypal"
                >
                  {t('footer.paypalBuy')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/skrill"
                >
                  {t('footer.skrillBuy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 3rd block - Feature */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <h3 className="text-base font-semibold dark:text-gray-100">{t('footer.feature')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/order"
                >
                  {t('nav.formOrder')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/cryptocurrencies"
                >
                  {t('footer.cryptoList')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/pricing"
                >
                  {t('footer.checkRate')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/calculator"
                >
                  {t('footer.calculator')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 4th block - Company */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <h3 className="text-base font-semibold dark:text-gray-100">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/about"
                >
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/blog"
                >
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/customers"
                >
                  {t('nav.testimonials')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/documentation"
                >
                  {t('footer.docs')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/support"
                >
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 5th block - Resources */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <h3 className="text-base font-semibold dark:text-gray-100">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/site-map"
                >
                  {t('footer.sitemap')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/terms-of-service"
                >
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/privacy-policy"
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                  href="/cookie-policy"
                >
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 6th block - Social */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <h3 className="text-base font-semibold dark:text-gray-100">{t('footer.followUs')}</h3>
            <ul className="flex gap-1">
              <li>
                <a
                  className="flex items-center justify-center text-blue-500 transition hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  href="https://wa.me/628119666620"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Bot"
                >
                  <svg
                    className="h-5 w-5 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16 0.5c-8.563 0-15.5 6.938-15.5 15.5s6.938 15.5 15.5 15.5c8.563 0 15.5-6.938 15.5-15.5s-6.938-15.5-15.5-15.5zM23.613 11.119l-2.544 11.988c-0.188 0.85-0.694 1.063-1.4 0.656l-3.875-2.856-1.869 1.8c-0.206 0.206-0.381 0.381-0.781 0.381l0.275-3.944 7.181-6.488c0.313-0.275-0.069-0.431-0.481-0.156l-8.875 5.587-3.825-1.194c-0.831-0.262-0.85-0.831 0.175-1.231l14.944-5.763c0.694-0.25 1.3 0.169 1.075 1.219z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="flex items-center justify-center text-blue-500 transition hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  href="https://wa.me/628119666620?text=Halo%20Saldopedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="h-5 w-5 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16 0C7.164 0 0 7.163 0 16c0 2.816.736 5.464 2.005 7.764L0 32l8.428-2.256A15.896 15.896 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.455c-2.563 0-5.005-.715-7.089-1.963l-.509-.308-5.28 1.413 1.398-5.149-.335-.527A13.384 13.384 0 0 1 2.545 16c0-7.407 6.048-13.455 13.455-13.455S29.455 8.593 29.455 16 23.407 29.455 16 29.455zm7.364-9.818c-.404-.203-2.391-1.182-2.761-1.316-.37-.134-.64-.202-.909.202-.269.404-1.042 1.316-1.278 1.585-.236.269-.471.303-.875.101-.404-.203-1.706-.63-3.249-2.006-1.201-1.07-2.011-2.391-2.247-2.795-.236-.404-.025-.622.177-.823.182-.18.404-.471.606-.707.202-.236.269-.404.404-.673.135-.269.067-.505-.034-.707-.101-.202-.909-2.191-1.245-3.001-.327-.787-.66-.68-.909-.694-.236-.012-.505-.015-.774-.015s-.707.101-1.077.505c-.37.404-1.413 1.382-1.413 3.371s1.447 3.911 1.649 4.18c.202.269 2.847 4.349 6.898 6.095.964.416 1.717.664 2.303.85.968.308 1.849.264 2.545.16.776-.115 2.391-.978 2.728-1.922.337-.944.337-1.753.236-1.922-.101-.169-.37-.269-.774-.471z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="flex items-center justify-center text-blue-500 transition hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  href="https://x.com/saldopedia_"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                >
                  <svg
                    className="h-5 w-5 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.42 14.009L27.891 3h-2.244l-8.224 9.559L10.855 3H3.28l9.932 14.455L3.28 29h2.244l8.684-10.095L21.145 29h7.576l-10.301-14.991zm-3.074 3.574l-1.006-1.439L6.333 4.69h3.447l6.462 9.243 1.006 1.439 8.4 12.015h-3.447l-6.854-9.804z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter block - Mobile: paling bawah, Desktop: baris kedua dengan lebar fix */}
          <div className="space-y-2 col-span-2 order-last md:col-span-6">
            <h3 className="text-base font-semibold dark:text-gray-100">{t('footer.newsletter')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('footer.newsletterDesc')}
            </p>
            <div className="flex-1">
              <NewsletterForm />
            </div>
            {/* System Status - Mobile only (below newsletter) */}
            <div className="mt-3 md:hidden">
              <SystemStatus />
            </div>
          </div>

          {/* Disclaimer - Di bawah newsletter */}
          <div className="col-span-2 md:col-span-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed text-center sm:text-left italic">
              <span className="font-semibold">{t('footer.disclaimer')}</span> {t('footer.disclaimerText')}
            </p>
          </div>

          {/* System Status - Desktop only (bottom right corner) */}
          <div className="hidden md:block col-span-2 md:col-span-12">
            <div className="flex justify-end">
              <SystemStatus />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
