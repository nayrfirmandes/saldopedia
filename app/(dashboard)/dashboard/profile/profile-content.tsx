'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { FormatSaldo } from '@/components/format-saldo';

type User = {
  email: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
  role: string;
  saldo: string;
};

export default function ProfileContent({ user }: { user: User }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('dashboardPages.profile.backToDashboard')}
        </Link>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboardPages.profile.title')}</h1>
      </div>

      <div className="flex items-center gap-4">
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.balance')}</p>
        <p className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight"><FormatSaldo amount={user.saldo} /></p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8 space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboardPages.settings.email')}</p>
            <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboardPages.settings.phone')}</p>
            <p className="text-sm text-gray-900 dark:text-white">{user.phone || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
