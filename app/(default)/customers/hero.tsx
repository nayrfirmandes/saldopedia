"use client";

import PageIllustration from "@/components/page-illustration";
import { useLanguage } from "@/contexts/language-context";

interface HeroProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

export default function Hero({ showForm, setShowForm }: HeroProps) {
  const { t } = useLanguage();

  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main content */}
        <div className="mx-auto max-w-3xl pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <div className="pb-10 text-center">
            <h1 className="mb-6 py-2 border-y text-5xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-6xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t('customersPage.hero.title')}
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
                {t('customersPage.hero.subtitle')} <strong className="text-blue-600 dark:text-blue-400">{t('customersPage.hero.subtitleBrand')}</strong> {t('customersPage.hero.subtitleEnd')}
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn group mb-4 w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
                  >
                    <span className="relative inline-flex items-center">
                      {t('customersPage.hero.shareButton')}{" "}
                      <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
