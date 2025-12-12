'use client';

import { useState, FormEvent, useRef } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import ReCaptcha, { ReCaptchaRef } from '@/components/ui/recaptcha';
import RecaptchaNotice from '@/components/ui/recaptcha-notice';
import { AnimateOnScroll } from '@/lib/use-animate-on-scroll';
import { useLanguage } from '@/contexts/language-context';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const recaptchaRef = useRef<ReCaptchaRef>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const captchaToken = recaptchaRef.current?.getValue();
    if (!captchaToken) {
      setError(t('auth.captcha.error'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || t('auth.forgotPassword.errorSend'));
      }
    } catch (err) {
      setError(t('auth.forgotPassword.errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <AnimateOnScroll animation="fade-up" duration={600}>
          <div className="space-y-6 text-center">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.forgotPassword.successTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('auth.forgotPassword.successMessage')} <strong>{email}</strong>. {t('auth.forgotPassword.successDescription')}
          </p>
          <Link 
            href="/login"
            className="inline-block py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
        </AnimateOnScroll>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <AnimateOnScroll animation="fade-up" duration={600}>
        <div className="space-y-6">
        <div className="mb-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {t('auth.forgotPassword.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {t('auth.forgotPassword.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.forgotPassword.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base"
              placeholder={t('auth.forgotPassword.emailPlaceholder')}
              required
            />
          </div>

          <div>
            <ReCaptcha
              ref={recaptchaRef}
              onExpired={() => setError(t('auth.captcha.expired'))}
              onError={() => setError(t('auth.captcha.errorVerify'))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed  text-sm"
          >
            {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendButton')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>

        <div className="mt-6">
          <RecaptchaNotice />
        </div>
      </div>
      </AnimateOnScroll>
    </div>
  );
}
