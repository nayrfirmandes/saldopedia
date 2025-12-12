'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';

interface UnifiedCountdownProps {
  id: string;
  expiresAt: string;
  status: string;
  type: 'order' | 'deposit';
  validStatuses?: string[];
  expiredRedirectPath?: string;
}

export default function UnifiedCountdown({ 
  id, 
  expiresAt, 
  status, 
  type,
  validStatuses = ['pending', 'pending_proof'],
  expiredRedirectPath
}: UnifiedCountdownProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  const parseExpiresAt = (expiresAtStr: string): number => {
    const parsed = new Date(expiresAtStr);
    if (!isNaN(parsed.getTime())) return parsed.getTime();
    
    const monthsEN: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const monthsID: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5, Jul: 6, Agu: 7, Agt: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11 };
    
    const partsEN = expiresAtStr.match(/(\d+)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+),?\s+(\d+)[:\.](\d+)/i);
    if (partsEN) {
      const d = new Date(parseInt(partsEN[3]), monthsEN[partsEN[2]], parseInt(partsEN[1]), parseInt(partsEN[4]), parseInt(partsEN[5]));
      return d.getTime();
    }
    
    const partsID = expiresAtStr.match(/(\d+)\s+(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Agt|Sep|Okt|Nov|Des)\s+(\d+),?\s+(\d+)[:\.](\d+)/i);
    if (partsID) {
      const d = new Date(parseInt(partsID[3]), monthsID[partsID[2]], parseInt(partsID[1]), parseInt(partsID[4]), parseInt(partsID[5]));
      return d.getTime();
    }
    
    return Date.now() + 3600000;
  };

  useEffect(() => {
    if (!validStatuses.includes(status)) {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = parseExpiresAt(expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        return 0;
      }

      setIsWarning(diff < 15 * 60 * 1000);
      return diff;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (expiredRedirectPath) {
          setTimeout(() => {
            router.push(expiredRedirectPath.replace('{id}', id));
          }, 2000);
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [expiresAt, status, router, id, validStatuses, expiredRedirectPath]);

  if (!validStatuses.includes(status)) {
    return null;
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  const time = formatTime(timeLeft);

  const getColorClasses = () => {
    if (isExpired) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-500',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-700 dark:text-red-300',
        number: 'text-red-700 dark:text-red-300',
        label: 'text-red-600 dark:text-red-400',
        separator: 'text-red-700 dark:text-red-300'
      };
    }
    if (isWarning) {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-500',
        icon: 'text-yellow-600 dark:text-yellow-400',
        title: 'text-yellow-700 dark:text-yellow-300',
        number: 'text-yellow-700 dark:text-yellow-300',
        label: 'text-yellow-600 dark:text-yellow-400',
        separator: 'text-yellow-700 dark:text-yellow-300'
      };
    }
    return {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-500',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-700 dark:text-blue-300',
      number: 'text-blue-700 dark:text-blue-300',
      label: 'text-blue-600 dark:text-blue-400',
      separator: 'text-blue-700 dark:text-blue-300'
    };
  };

  const colors = getColorClasses();

  if (isExpired) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-lg px-4 py-3 animate-pulse`}>
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${colors.icon}`} />
          <div>
            <span className={`text-sm font-medium ${colors.title}`}>
              {type === 'order' ? t('orderPages.countdown.expired') : t('dashboardPages.deposit.depositExpired')}
            </span>
            {expiredRedirectPath && (
              <span className={`text-xs ${colors.label} ml-2`}>
                {t('orderPages.countdown.redirecting')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg px-4 py-2.5 transition-all duration-300 ${isWarning ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isWarning ? (
            <AlertTriangle className={`h-4 w-4 ${colors.icon} flex-shrink-0`} />
          ) : (
            <Clock className={`h-4 w-4 ${colors.icon} flex-shrink-0`} />
          )}
          <span className={`text-xs font-medium ${colors.title}`}>
            {isWarning ? t('orderPages.countdown.completeSoon') : t('orderPages.countdown.timeRemaining')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-baseline gap-0.5">
            <span className={`text-lg font-bold ${colors.number} tabular-nums`}>
              {String(time.hours).padStart(2, '0')}
            </span>
            <span className={`text-[10px] ${colors.label}`}>{t('orderPages.countdown.hours')}</span>
          </div>
          <span className={`text-lg font-bold ${colors.separator} mx-0.5`}>:</span>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-lg font-bold ${colors.number} tabular-nums`}>
              {String(time.minutes).padStart(2, '0')}
            </span>
            <span className={`text-[10px] ${colors.label}`}>{t('orderPages.countdown.minutes')}</span>
          </div>
          <span className={`text-lg font-bold ${colors.separator} mx-0.5`}>:</span>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-lg font-bold ${colors.number} tabular-nums`}>
              {String(time.seconds).padStart(2, '0')}
            </span>
            <span className={`text-[10px] ${colors.label}`}>{t('orderPages.countdown.seconds')}</span>
          </div>
        </div>
      </div>
      {isWarning && (
        <p className={`text-[10px] ${colors.label} mt-1.5 text-center flex items-center justify-center gap-1`}>
          <AlertTriangle className="w-3 h-3" />
          {type === 'order' ? t('orderPages.countdown.adminMustProcess') : t('dashboardPages.deposit.completeTransferSoon')}
        </p>
      )}
    </div>
  );
}
