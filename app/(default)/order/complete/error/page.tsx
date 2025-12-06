"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

function ErrorContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const reason = searchParams.get('reason') || 'unknown';

  const errorMessages: Record<string, { title: string; description: string }> = {
    invalid_token: {
      title: t('orderPages.error.invalidToken'),
      description: t('orderPages.error.invalidTokenDesc'),
    },
    not_found: {
      title: t('orderPages.error.notFound'),
      description: t('orderPages.error.notFoundDesc'),
    },
    server_error: {
      title: t('orderPages.error.serverError'),
      description: t('orderPages.error.serverErrorDesc'),
    },
    unknown: {
      title: t('orderPages.error.unknown'),
      description: t('orderPages.error.unknownDesc'),
    },
  };

  const error = errorMessages[reason] || errorMessages.unknown;

  return (
    <section className="relative">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error.title}
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {error.description}
            </p>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 font-mono">
              {reason}
            </p>

            <a 
              href="https://wa.me/628119666620"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              {t('orderPages.error.contactAdmin')}
            </a>

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

export default function OrderCompletionErrorPage() {
  return (
    <Suspense fallback={
      <section className="relative">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="pb-12 pt-32 md:pb-20 md:pt-40">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    }>
      <ErrorContent />
    </Suspense>
  );
}
