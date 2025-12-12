'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

type StatusType = 'operational' | 'degraded' | 'down';

function SystemStatus() {
  const [status, setStatus] = useState<StatusType>('operational');
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    
    const checkHealth = async () => {
      const startTime = Date.now();
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          cache: 'no-store'
        });
        const elapsed = Date.now() - startTime;
        
        if (!response.ok) {
          setStatus('down');
        } else if (elapsed > 5000) {
          setStatus('degraded');
        } else {
          setStatus('operational');
        }
      } catch {
        setStatus('down');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const statusConfig = {
    operational: {
      color: 'bg-green-500',
      text: t('footer.systemStatus.operational'),
    },
    degraded: {
      color: 'bg-yellow-500',
      text: t('footer.systemStatus.degraded'),
    },
    down: {
      color: 'bg-red-500',
      text: t('footer.systemStatus.down'),
    },
  };

  const config = statusConfig[status];

  return (
    <Link 
      href="/status"
      className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      <span className="relative flex h-2 w-2 mt-0.5 flex-shrink-0">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.color} opacity-75`}></span>
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.color}`}></span>
      </span>
      <span className="leading-tight">{config.text}</span>
    </Link>
  );
}

export default memo(SystemStatus);
