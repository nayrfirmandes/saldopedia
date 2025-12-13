'use client';

import { useState, FormEvent, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/logo';
import ReCaptcha, { ReCaptchaRef } from '@/components/ui/recaptcha';
import RecaptchaNotice from '@/components/ui/recaptcha-notice';
import { AnimateOnScroll } from '@/lib/use-animate-on-scroll';
import { useLanguage } from '@/contexts/language-context';
import { Check, X, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

function getPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  let color = 'bg-red-500';
  let textColor = 'text-red-600 dark:text-red-400';
  
  if (score >= 5) {
    strength = 'strong';
    color = 'bg-green-500';
    textColor = 'text-green-600 dark:text-green-400';
  } else if (score >= 4) {
    strength = 'good';
    color = 'bg-blue-500';
    textColor = 'text-blue-600 dark:text-blue-400';
  } else if (score >= 3) {
    strength = 'fair';
    color = 'bg-yellow-500';
    textColor = 'text-yellow-600 dark:text-yellow-400';
  }
  
  return { checks, score, strength, color, textColor };
}

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recaptchaRef = useRef<ReCaptchaRef>(null);
  const redirectUrl = searchParams.get('redirect');
  const referralParam = searchParams.get('ref');
  
  const [step, setStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: referralParam || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const phoneCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const strengthLabels: Record<string, string> = {
    weak: t('auth.register.passwordStrength.weak'),
    fair: t('auth.register.passwordStrength.fair'),
    good: t('auth.register.passwordStrength.good'),
    strong: t('auth.register.passwordStrength.strong'),
  };

  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;
    
    setEmailChecking(true);
    setEmailError('');
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.available) {
        setEmailError(data.error || t('auth.register.step.emailTaken'));
      }
    } catch (err) {
      console.error('Email check error:', err);
    } finally {
      setEmailChecking(false);
    }
  }, [t]);

  const checkPhoneAvailability = useCallback(async (phone: string) => {
    if (!phone.trim()) return;
    
    setPhoneChecking(true);
    setPhoneError('');
    try {
      const res = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.available) {
        setPhoneError(data.error || t('auth.register.step.phoneTaken'));
      }
    } catch (err) {
      console.error('Phone check error:', err);
    } finally {
      setPhoneChecking(false);
    }
  }, [t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'email') {
      setEmailError('');
      if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
      emailCheckTimeout.current = setTimeout(() => checkEmailAvailability(value), 500);
    }
    
    if (name === 'phone') {
      setPhoneError('');
      if (phoneCheckTimeout.current) clearTimeout(phoneCheckTimeout.current);
      phoneCheckTimeout.current = setTimeout(() => checkPhoneAvailability(value), 500);
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError(t('auth.register.step.nameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t('auth.register.step.emailRequired'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('auth.register.step.emailInvalid'));
      return false;
    }
    if (emailError) {
      setError(emailError);
      return false;
    }
    if (emailChecking) {
      setError(t('auth.register.step.checkingEmail'));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (phoneError) {
      setError(phoneError);
      return false;
    }
    if (phoneChecking) {
      setError(t('auth.register.step.checkingPhone'));
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    
    if (step === 1 && validateStep1()) {
      setStepLoading(true);
      setTimeout(() => {
        setStep(2);
        setStepLoading(false);
      }, 400);
    } else if (step === 2 && validateStep2()) {
      setStepLoading(true);
      setTimeout(() => {
        setStep(3);
        setStepLoading(false);
      }, 400);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.errorRegister'));
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError(t('auth.register.termsRequired'));
      setLoading(false);
      return;
    }

    const captchaToken = recaptchaRef.current?.getValue();
    if (!captchaToken) {
      setError(t('auth.captcha.error'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          referralCode: formData.referralCode || undefined,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || t('auth.register.errorRegister'));
      }
    } catch (err) {
      setError(t('auth.register.errorGeneral'));
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
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.register.successTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('auth.register.successMessage')} <strong>{formData.email}</strong>. {t('auth.register.successDescription')}
          </p>
          <Link 
            href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
            className="inline-block py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {t('auth.register.backToLogin')}
          </Link>
        </div>
        </AnimateOnScroll>
      </div>
    );
  }

  if (stepLoading) {
    return (
      <div className="w-full max-w-sm">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-[3px] border-blue-600/20 dark:border-blue-400/20 rounded-full"></div>
              <div className="absolute inset-0 border-[3px] border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <AnimateOnScroll animation="fade-up" duration={600} key={step}>
        <div className="space-y-6">
          <div className="mb-8">
            <div className="mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {t('auth.register.title')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {step === 1 && t('auth.register.step.subtitle1')}
              {step === 2 && t('auth.register.step.subtitle2')}
              {step === 3 && t('auth.register.step.subtitle3')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.register.fullName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base"
                  required
                  autoFocus
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {t('auth.register.nameNote')}
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.register.email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('auth.register.emailPlaceholder')}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base ${
                      emailError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  />
                  {emailChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {emailChecking && (
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {t('auth.register.step.checkingEmail')}
                  </p>
                )}
                {emailError && !emailChecking && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{emailError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={emailChecking || !!emailError}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('auth.register.step.next')}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    {t('auth.register.orDivider')}
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
                  {t('auth.register.googleButton')}
                </a>

                <a
                  href="/api/auth/facebook"
                  className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {t('auth.register.facebookButton')}
                </a>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.register.haveAccount')}{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
                    {t('auth.register.loginLink')}
                  </Link>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.register.phone')}
                  <span className="ml-1 text-gray-400 font-normal">({t('auth.register.step.optional')})</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('auth.register.phonePlaceholder')}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base ${
                      phoneError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    autoFocus
                  />
                  {phoneChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {phoneChecking && (
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {t('auth.register.step.checkingPhone')}
                  </p>
                )}
                {phoneError && !phoneChecking && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{phoneError}</p>
                )}
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.register.referralCode')}
                  <span className="ml-1 text-gray-400 font-normal">({t('auth.register.step.optional')})</span>
                </label>
                <input
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder={t('auth.register.referralCodePlaceholder')}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base uppercase"
                  maxLength={20}
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {t('auth.register.referralCodeNote')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={phoneChecking || !!phoneError}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('auth.register.step.next')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.register.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('auth.register.passwordPlaceholder')}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`ml-3 text-xs font-medium ${passwordStrength.textColor}`}>
                        {strengthLabels[passwordStrength.strength]}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className={`flex items-center gap-1.5 ${passwordStrength.checks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {passwordStrength.checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.register.passwordChecks.length')}
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordStrength.checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {passwordStrength.checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.register.passwordChecks.lowercase')}
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordStrength.checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {passwordStrength.checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.register.passwordChecks.uppercase')}
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordStrength.checks.number ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {passwordStrength.checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.register.passwordChecks.number')}
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordStrength.checks.special ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {passwordStrength.checks.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.register.passwordChecks.special')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.register.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  {t('auth.register.agreeToTerms')}{' '}
                  <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                    {t('auth.register.termsOfService')}
                  </Link>
                  {' '}{t('auth.register.and')}{' '}
                  <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                    {t('auth.register.privacyPolicy')}
                  </Link>
                </label>
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
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? t('auth.register.registering') : t('auth.register.registerButton')}
              </button>

              <div className="mt-6">
                <RecaptchaNotice />
              </div>
            </form>
          )}
        </div>
      </AnimateOnScroll>
    </div>
  );
}
