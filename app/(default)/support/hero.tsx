"use client";

import PageIllustration from "@/components/page-illustration";
import Search from "./search";
import { useLanguage } from "@/contexts/language-context";

export default function Hero({ onSearch }: { onSearch: (query: string) => void }) {
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
              {t("supportPage.hero.title")} <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-500">Saldopedia</span>
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="mb-4 text-lg text-gray-700 dark:text-gray-300">
                {t("supportPage.hero.subtitle")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {t("supportPage.hero.features.fastResponse")}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {t("supportPage.hero.features.support247")}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {t("supportPage.hero.features.experiencedTeam")}
                </div>
              </div>
            </div>
          </div>
          {/* Search */}
          <Search onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
