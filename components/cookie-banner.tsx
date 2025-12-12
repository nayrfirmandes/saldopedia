'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import {
  getCookieConsent,
  saveCookieConsent,
  hasUserMadeChoice,
  defaultConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);

  useEffect(() => {
    // Show banner only if user hasn't made a choice
    if (!hasUserMadeChoice()) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: CookieConsent = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    };
    saveCookieConsent(fullConsent);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    // Only keep necessary cookies
    saveCookieConsent(defaultConsent);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(consent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleToggleCategory = (category: keyof CookieConsent) => {
    if (category === 'necessary') return; // Can't toggle necessary
    
    setConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-8">
            {!showSettings ? (
              // Simple Banner View
              <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 md:mb-2 flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                    <span>Kami Menggunakan Cookie</span>
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                    Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas situs, 
                    dan mempersonalisasi konten. Anda dapat memilih kategori cookie yang ingin Anda terima.{' '}
                    <Link href="/cookie-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Pelajari lebih lanjut
                    </Link>
                  </p>
                </div>

                <div className="flex flex-row gap-2 items-center flex-shrink-0">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Pengaturan
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-3 py-1.5 text-xs md:text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Terima Semua
                  </button>
                </div>
              </div>
            ) : (
              // Settings View
              <div className="max-h-[70vh] md:max-h-none overflow-y-auto">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Pengaturan Cookie
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                    aria-label="Tutup pengaturan"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  Pilih kategori cookie yang ingin Anda terima. Cookie yang diperlukan selalu aktif karena 
                  penting untuk fungsi dasar website.
                </p>

                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">Cookie yang Diperlukan</h4>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          Selalu Aktif
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Cookie esensial untuk fungsi dasar website seperti navigasi dan keamanan.
                      </p>
                    </div>
                  </div>

                  {/* Preferences Cookies */}
                  <div className="flex items-start justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                    <div className="flex-1 pr-2">
                      <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">Cookie Preferensi</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Mengingat pilihan Anda seperti bahasa dan pengaturan tampilan.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-2 md:ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={consent.preferences}
                        onChange={() => handleToggleCategory('preferences')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                    <div className="flex-1 pr-2">
                      <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">Cookie Analitik</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Membantu kami memahami bagaimana pengunjung berinteraksi dengan website.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-2 md:ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={consent.analytics}
                        onChange={() => handleToggleCategory('analytics')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                    <div className="flex-1 pr-2">
                      <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">Cookie Marketing</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Digunakan untuk menampilkan iklan yang relevan dengan minat Anda.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-2 md:ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={consent.marketing}
                        onChange={() => handleToggleCategory('marketing')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={handleRejectAll}
                    className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Tolak Semua
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="px-3 py-1.5 text-xs md:text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Simpan Preferensi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
