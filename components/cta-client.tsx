'use client';

import { useLanguage } from "@/contexts/language-context";

export function CtaClient({ type = 'title' }: { type?: 'title' | 'button' }) {
  const { t } = useLanguage();
  
  if (type === 'button') {
    return (
      <span className="relative inline-flex items-center">
        {t('nav.formOrder')}{" "}
        <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    );
  }
  
  return (
    <h2 className="mb-6 py-2 border-y text-3xl font-bold text-white dark:text-gray-100 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-700/.7),transparent)1] md:mb-8 md:text-4xl">
      {t('cta.title')}
    </h2>
  );
}
