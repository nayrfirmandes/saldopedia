'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function SettingsContent() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dashboardPages.settings.backToDashboard')}
      </Link>
      
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('dashboardPages.settings.title')}</h1>
    </div>
  );
}
