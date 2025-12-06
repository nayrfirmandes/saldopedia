'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/logo';
import { useLanguage } from '@/contexts/language-context';

function VerifyEmailContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    // Check if token is missing or empty
    if (!token || token.trim() === '') {
      setStatus('error');
      setMessage(t('auth.verifyEmail.errorNoToken'));
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setAutoLogin(data.autoLogin || false);
          
          if (data.autoLogin) {
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1500);
          }
        } else {
          setStatus('error');
          setMessage(data.error || t('auth.verifyEmail.errorTitle'));
        }
      } catch (err) {
        setStatus('error');
        setMessage(t('auth.verifyEmail.errorGeneral'));
      }
    };

    verifyEmail();
  }, [token, t]);

  if (status === 'loading') {
    return (
      <div className="w-full max-w-sm">
        <div className="space-y-6 text-center">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.verifyEmail.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.verifyEmail.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-sm">
        <div className="space-y-6 text-center">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.verifyEmail.errorTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
          <Link 
            href="/login"
            className="inline-block py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t('auth.register.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="space-y-6 text-center">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('auth.verifyEmail.successTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        {autoLogin ? (
          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
            <span>{t('auth.verifyEmail.redirecting')}</span>
          </div>
        ) : (
          <Link 
            href="/login"
            className="inline-block py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t('auth.verifyEmail.goToDashboard')}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
