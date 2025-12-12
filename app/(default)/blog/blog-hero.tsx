"use client";

import { useLanguage } from "@/contexts/language-context";

export default function BlogHero() {
  const { t } = useLanguage();

  return (
    <div className="pb-12 text-center md:pb-16">
      <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl dark:text-gray-100">
        {t('blogPage.hero.title')} <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-500">{t('blogPage.hero.titleBrand')}</span>
      </h1>
      <p className="text-base text-gray-600 md:text-lg dark:text-gray-300">
        {t('blogPage.hero.subtitle')} <span className="font-semibold text-blue-600 dark:text-blue-400">{t('blogPage.hero.subtitleBrand')}</span>
      </p>
    </div>
  );
}
