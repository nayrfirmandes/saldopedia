'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import RecaptchaNotice from '@/components/ui/recaptcha-notice';
import { AnimateOnScroll } from '@/lib/use-animate-on-scroll';
import { useLanguage } from '@/contexts/language-context';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [timeoutMessage, setTimeoutMessage] = useState('');

  useEffect(() => {
    const reason = searchParams.get('reason');
    const googleError = searchParams.get('error');
    
    if (reason === 'timeout') {
      setTimeoutMessage(t('auth.login.sessionTimeout'));
    }
    
    // Handle OAuth errors (Google & Facebook)
    if (googleError) {
      const errorMessages: Record<string, string> = {
        'google_auth_cancelled': 'Login dengan Google dibatalkan',
        'google_auth_failed': 'Login dengan Google gagal. Silakan coba lagi.',
        'google_not_configured': 'Google OAuth belum dikonfigurasi',
        'google_token_failed': 'Gagal mendapatkan token dari Google. Pastikan redirect URI sudah benar di Google Console.',
        'google_userinfo_failed': 'Gagal mendapatkan informasi user dari Google',
        'google_auth_error': 'Terjadi kesalahan saat login dengan Google',
        'facebook_auth_cancelled': 'Login dengan Facebook dibatalkan',
        'facebook_auth_failed': 'Login dengan Facebook gagal. Silakan coba lagi.',
        'facebook_not_configured': 'Facebook OAuth belum dikonfigurasi',
        'facebook_token_failed': 'Gagal mendapatkan token dari Facebook.',
        'facebook_userinfo_failed': 'Gagal mendapatkan informasi user dari Facebook',
        'facebook_no_email': 'Akun Facebook tidak memiliki email. Silakan gunakan metode login lain.',
        'facebook_auth_error': 'Terjadi kesalahan saat login dengan Facebook',
      };
      setError(errorMessages[googleError] || 'Terjadi kesalahan login');
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResendButton(false);
    setResendSuccess('');
    setTimeoutMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const redirectUrl = searchParams.get('redirect') || '/dashboard';
        window.location.href = redirectUrl;
      } else {
        setError(data.error || t('auth.login.errorLogin'));
        if (data.error && data.error.includes(t('auth.login.errorNotVerified'))) {
          setShowResendButton(true);
        }
      }
    } catch (err) {
      setError(t('auth.login.errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess('');
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setResendSuccess(data.message);
        setShowResendButton(false);
      } else {
        setError(data.error || t('auth.login.errorLogin'));
      }
    } catch (err) {
      setError(t('auth.login.errorGeneral'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <AnimateOnScroll animation="fade-up" duration={600}>
        <div className="space-y-6">
        <div className="mb-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {t('auth.login.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {t('auth.login.subtitle')}
          </p>
        </div>

        {timeoutMessage && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">{timeoutMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            {showResendButton && (
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? t('auth.login.resending') : t('auth.login.resendVerification')}
              </button>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">{resendSuccess}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.login.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base"
              placeholder={t('auth.login.emailPlaceholder')}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.login.passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base"
                placeholder={t('auth.login.passwordPlaceholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end text-sm">
            <Link 
              href="/forgot-password" 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.login.loading') : t('auth.login.loginButton')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              {t('auth.login.orDivider')}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="/api/auth/google"
            className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.login.googleButton')}
          </a>

          <a
            href="/api/auth/facebook"
            className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {t('auth.login.facebookButton')}
          </a>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.login.noAccount')}{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
              {t('auth.login.registerNow')}
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <RecaptchaNotice />
        </div>
      </div>
      </AnimateOnScroll>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm"><div className="space-y-6 animate-pulse"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div><div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div><div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
