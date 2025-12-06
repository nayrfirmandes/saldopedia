'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';

interface OrderCountdownProps {
  orderId: string;
  expiresAt: string;
  status: string;
}

export default function OrderCountdown({ orderId, expiresAt, status }: OrderCountdownProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    // Only show countdown for pending or pending_proof status
    if (status !== 'pending' && status !== 'pending_proof') {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        return 0;
      }

      // Show warning when less than 15 minutes
      setIsWarning(diff < 15 * 60 * 1000);
      return diff;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        // Auto-redirect to expired page after 2 seconds
        setTimeout(() => {
          router.push(`/order/expired?orderId=${orderId}`);
        }, 2000);
      }
    }, 1000);

    // Removed automatic router.refresh() - causing performance issues
    // Admin can manually refresh to check status

    return () => {
      clearInterval(timer);
    };
  }, [expiresAt, status, router]);

  // Don't show countdown if not pending or pending_proof
  if (status !== 'pending' && status !== 'pending_proof') {
    return null;
  }

  // Format time
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      display: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  };

  const time = formatTime(timeLeft);

  if (isExpired) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3 md:p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
              {t('orderPages.countdown.expired')}
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              {t('orderPages.countdown.redirecting')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-lg p-3 md:p-4 transition-all duration-300 ${
      isWarning 
        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 animate-pulse' 
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isWarning 
            ? 'bg-yellow-100 dark:bg-yellow-900/40' 
            : 'bg-blue-100 dark:bg-blue-900/40'
        }`}>
          <Clock className={`w-5 h-5 ${
            isWarning 
              ? 'text-yellow-600 dark:text-yellow-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-medium mb-1 ${
            isWarning 
              ? 'text-yellow-900 dark:text-yellow-100' 
              : 'text-blue-900 dark:text-blue-100'
          }`}>
            {isWarning ? t('orderPages.countdown.completeSoon') : t('orderPages.countdown.timeRemaining')}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold font-mono ${
              isWarning 
                ? 'text-yellow-700 dark:text-yellow-300' 
                : 'text-blue-700 dark:text-blue-300'
            }`}>
              {time.display}
            </p>
            <p className={`text-xs ${
              isWarning 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              ({time.hours}{t('orderPages.countdown.hours')} {time.minutes}{t('orderPages.countdown.minutes')} {time.seconds}{t('orderPages.countdown.seconds')})
            </p>
          </div>
        </div>
      </div>
      {isWarning && (
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {t('orderPages.countdown.adminMustProcess')}
        </p>
      )}
    </div>
  );
}
