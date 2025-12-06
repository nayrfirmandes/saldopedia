"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import { useLanguage } from '@/contexts/language-context';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const orderId = searchParams.get('orderId');
  const alreadyCompleted = searchParams.get('already_completed') === 'true';

  return (
    <section className="relative">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {alreadyCompleted ? t('orderPages.complete.alreadyCompletedTitle') : t('orderPages.complete.successTitle')}
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {alreadyCompleted 
                ? t('orderPages.complete.alreadyCompletedDesc')
                : t('orderPages.complete.successDesc')
              }
            </p>

            {orderId && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Order ID: <span className="font-mono font-medium">{orderId}</span>
              </p>
            )}

            <Link 
              href="/dashboard/orders" 
              className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              {t('orderPages.complete.viewOrders')}
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

export default function OrderCompletionSuccessPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="spinner" className="pt-40" />}>
      <SuccessContent />
    </Suspense>
  );
}
