'use client';

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function OrderExpiredPage() {
  const { t } = useLanguage();

  return (
    <section className="relative">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('orderPages.expired.title')}
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('orderPages.expired.description')}
            </p>

            <Link 
              href="/order" 
              className="btn group bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%]"
            >
              <span className="relative inline-flex items-center">
                {t('orderPages.expired.createNew')}{" "}
                <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href="/" 
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {t('orderPages.expired.backToHome')}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
