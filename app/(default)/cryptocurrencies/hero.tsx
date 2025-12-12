'use client';

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import PageIllustration from "@/components/page-illustration";

export default function Hero() {
  const { t } = useLanguage();
  
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Hero content */}
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 py-2 border-y text-4xl font-bold dark:text-gray-100 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-700/.8),transparent)1] md:text-5xl">
              {t("cryptoPage.hero.titlePart1")}{" "}
              <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 bg-clip-text text-transparent">
                {t("cryptoPage.hero.titleHighlight")}
              </span>
            </h1>
            <p className="mb-6 text-base text-gray-600 dark:text-gray-300 md:mb-8 md:text-lg"  >
              {t("cryptoPage.hero.subtitle")} <strong className="text-blue-600 dark:text-blue-400">{t("cryptoPage.hero.subtitleBrand")}</strong>{t("cryptoPage.hero.subtitleEnd")}
            </p>
            <div className="mx-auto max-w-xs sm:max-w-none sm:flex sm:justify-center"  >
              <Link
                className="btn group w-full bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:w-auto"
                href="/order"
              >
                <span className="relative inline-flex items-center">
                  {t("cryptoPage.hero.button1")}{" "}
                  <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
