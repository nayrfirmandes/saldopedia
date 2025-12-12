'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

export default function RecaptchaNotice() {
  const { t } = useLanguage();
  
  return (
    <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
      {t('auth.recaptcha.protectedBy')}{' '}
      <Link 
        href="/privacy-policy" 
        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        {t('auth.recaptcha.privacyPolicy')}
      </Link>{' '}
      {t('auth.recaptcha.and')}{' '}
      <Link 
        href="/terms-of-service" 
        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        {t('auth.recaptcha.termsOfService')}
      </Link>{' '}
      {t('auth.recaptcha.apply')}
    </p>
  );
}
