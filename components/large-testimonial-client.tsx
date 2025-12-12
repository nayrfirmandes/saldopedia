'use client';

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";

export function LargeTestimonialClient() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          <span className="inline-block h-7 w-full max-w-lg bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
        </p>
        <div className="text-sm font-medium text-gray-500">
          <span className="inline-block h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
        </div>
      </>
    );
  }
  
  return (
    <>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        "{t('largeTestimonial.quote')}{" "}
        <em className="italic text-gray-500">{t('largeTestimonial.quoteHighlight')}</em>
        {t('largeTestimonial.quoteEnd')}"
      </p>
      <div className="text-sm font-medium text-gray-500">
        <span className="text-gray-700 dark:text-gray-300">{t('largeTestimonial.author')}</span>{" "}
        <span className="text-gray-400">/</span>{" "}
        <span className="text-blue-500">
          {t('largeTestimonial.role')}
        </span>
      </div>
    </>
  );
}
