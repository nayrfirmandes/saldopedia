'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

export default function NewsletterForm() {
  const { t, isHydrated } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [message]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || t('newsletter.successMessage'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || t('newsletter.errorMessage'));
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      setStatus('error');
      setMessage(t('newsletter.connectionError'));
    }
  }, [email, t]);

  if (!isHydrated) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex gap-2">
          <div className="w-48 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletter.placeholder')}
          required
          disabled={status === 'loading'}
          className="w-48 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === 'loading' ? t('newsletter.sending') : t('newsletter.button')}
        </button>
      </form>
      
      {message && (
        <p
          ref={messageRef}
          className={`mt-2 text-sm ${
            status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
