'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, Clock, Activity, Globe, Wallet, CreditCard, Bitcoin, TrendingUp } from 'lucide-react';

type ServiceStatus = 'operational' | 'degraded' | 'down' | 'checking';

interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  responseTime: number | null;
  lastChecked: Date | null;
  icon: React.ElementType;
  details?: string;
}

export default function StatusPage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceCheck[]>([
    { name: 'platform', status: 'checking', responseTime: null, lastChecked: null, icon: Activity },
    { name: 'cryptoRates', status: 'checking', responseTime: null, lastChecked: null, icon: Bitcoin },
    { name: 'paypalRates', status: 'checking', responseTime: null, lastChecked: null, icon: Wallet },
    { name: 'skrillRates', status: 'checking', responseTime: null, lastChecked: null, icon: CreditCard },
    { name: 'website', status: 'checking', responseTime: null, lastChecked: null, icon: Globe },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [uptime, setUptime] = useState<number>(99.9);

  const checkServices = useCallback(async () => {
    setIsRefreshing(true);
    
    const checkHealth = async (): Promise<{ status: ServiceStatus; responseTime: number }> => {
      const start = Date.now();
      try {
        const response = await fetch('/api/health', { cache: 'no-store' });
        const elapsed = Date.now() - start;
        if (!response.ok) return { status: 'down', responseTime: elapsed };
        if (elapsed > 5000) return { status: 'degraded', responseTime: elapsed };
        return { status: 'operational', responseTime: elapsed };
      } catch {
        return { status: 'down', responseTime: Date.now() - start };
      }
    };

    const checkRates = async (): Promise<{ 
      crypto: { status: ServiceStatus; responseTime: number; count?: number };
      paypal: { status: ServiceStatus; responseTime: number; count?: number };
      skrill: { status: ServiceStatus; responseTime: number; count?: number };
    }> => {
      const start = Date.now();
      try {
        const response = await fetch('/api/rates', { cache: 'no-store' });
        const elapsed = Date.now() - start;
        
        if (!response.ok) {
          return {
            crypto: { status: 'down', responseTime: elapsed },
            paypal: { status: 'down', responseTime: elapsed },
            skrill: { status: 'down', responseTime: elapsed },
          };
        }
        
        const data = await response.json();
        const cryptoCount = data.cryptoConfig ? Object.keys(data.cryptoConfig).length : 0;
        const paypalCount = data.paypalRates ? Object.keys(data.paypalRates).length : 0;
        const skrillCount = data.skrillRates ? Object.keys(data.skrillRates).length : 0;
        
        const getStatus = (count: number): ServiceStatus => {
          if (count === 0) return 'down';
          if (elapsed > 5000) return 'degraded';
          return 'operational';
        };
        
        return {
          crypto: { status: getStatus(cryptoCount), responseTime: elapsed, count: cryptoCount },
          paypal: { status: getStatus(paypalCount), responseTime: elapsed, count: paypalCount },
          skrill: { status: getStatus(skrillCount), responseTime: elapsed, count: skrillCount },
        };
      } catch {
        const elapsed = Date.now() - start;
        return {
          crypto: { status: 'down', responseTime: elapsed },
          paypal: { status: 'down', responseTime: elapsed },
          skrill: { status: 'down', responseTime: elapsed },
        };
      }
    };

    const checkWebsite = async (): Promise<{ status: ServiceStatus; responseTime: number }> => {
      const start = Date.now();
      try {
        const response = await fetch('/', { cache: 'no-store', method: 'HEAD' });
        const elapsed = Date.now() - start;
        if (!response.ok) return { status: 'down', responseTime: elapsed };
        if (elapsed > 3000) return { status: 'degraded', responseTime: elapsed };
        return { status: 'operational', responseTime: elapsed };
      } catch {
        return { status: 'down', responseTime: Date.now() - start };
      }
    };

    const [dbResult, ratesResult, webResult] = await Promise.all([
      checkHealth(),
      checkRates(),
      checkWebsite(),
    ]);

    const now = new Date();
    setServices([
      { 
        name: 'platform', 
        status: dbResult.status, 
        responseTime: dbResult.responseTime, 
        lastChecked: now, 
        icon: Activity 
      },
      { 
        name: 'cryptoRates', 
        status: ratesResult.crypto.status, 
        responseTime: ratesResult.crypto.responseTime, 
        lastChecked: now, 
        icon: Bitcoin,
        details: ratesResult.crypto.count ? `${ratesResult.crypto.count} crypto` : undefined
      },
      { 
        name: 'paypalRates', 
        status: ratesResult.paypal.status, 
        responseTime: ratesResult.paypal.responseTime, 
        lastChecked: now, 
        icon: Wallet,
        details: ratesResult.paypal.count ? `${ratesResult.paypal.count} tier` : undefined
      },
      { 
        name: 'skrillRates', 
        status: ratesResult.skrill.status, 
        responseTime: ratesResult.skrill.responseTime, 
        lastChecked: now, 
        icon: CreditCard,
        details: ratesResult.skrill.count ? `${ratesResult.skrill.count} tier` : undefined
      },
      { 
        name: 'website', 
        status: webResult.status, 
        responseTime: webResult.responseTime, 
        lastChecked: now, 
        icon: Globe 
      },
    ]);
    setLastUpdated(now);
    setIsRefreshing(false);
    
    const operationalCount = [dbResult.status, ratesResult.crypto.status, ratesResult.paypal.status, ratesResult.skrill.status, webResult.status]
      .filter(s => s === 'operational').length;
    setUptime(Math.round((operationalCount / 5) * 100 * 10) / 10);
  }, []);

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, [checkServices]);

  const getOverallStatus = (): ServiceStatus => {
    if (services.some(s => s.status === 'checking')) return 'checking';
    if (services.some(s => s.status === 'down')) return 'down';
    if (services.some(s => s.status === 'degraded')) return 'degraded';
    return 'operational';
  };

  const getStatusConfig = (status: ServiceStatus) => {
    const configs = {
      operational: { 
        icon: CheckCircle2, 
        color: 'text-green-600 dark:text-green-400', 
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        dot: 'bg-green-500'
      },
      degraded: { 
        icon: AlertCircle, 
        color: 'text-yellow-600 dark:text-yellow-400', 
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        dot: 'bg-yellow-500'
      },
      down: { 
        icon: XCircle, 
        color: 'text-red-600 dark:text-red-400', 
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        dot: 'bg-red-500'
      },
      checking: { 
        icon: RefreshCw, 
        color: 'text-gray-600 dark:text-gray-400', 
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-200 dark:border-gray-700',
        dot: 'bg-gray-500'
      },
    };
    return configs[status];
  };

  const getAverageResponseTime = (): number => {
    const times = services.filter(s => s.responseTime !== null).map(s => s.responseTime!);
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  };

  const overallStatus = getOverallStatus();
  const overallConfig = getStatusConfig(overallStatus);

  return (
    <div className="min-h-screen pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t('statusPage.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('statusPage.subtitle')}
          </p>
        </div>

        <div className={`rounded-2xl p-5 mb-6 border ${overallConfig.border} ${overallConfig.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="relative flex h-3 w-3">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${overallConfig.dot} opacity-75`}></span>
                  <span className={`relative inline-flex h-3 w-3 rounded-full ${overallConfig.dot}`}></span>
                </span>
              </div>
              <div>
                <h2 className={`text-base font-semibold ${overallConfig.color}`}>
                  {t(`statusPage.overall.${overallStatus}`)}
                </h2>
                {lastUpdated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={checkServices}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-sm"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{uptime}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('statusPage.uptime')}</p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getAverageResponseTime()}<span className="text-sm font-normal">ms</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('statusPage.avgResponse')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 px-1">
            {t('statusPage.services')}
          </h3>
          
          {services.map((service) => {
            const config = getStatusConfig(service.status);
            const StatusIcon = config.icon;
            const ServiceIcon = service.icon;
            
            return (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${config.bg} border ${config.border}`}>
                    <ServiceIcon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(`statusPage.serviceNames.${service.name}`)}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {service.responseTime !== null && (
                        <span>{service.responseTime}ms</span>
                      )}
                      {service.details && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <span>{service.details}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                    {t(`statusPage.status.${service.status}`)}
                  </span>
                  <StatusIcon className={`h-4 w-4 ${config.color} ${service.status === 'checking' ? 'animate-spin' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">{t('statusPage.autoRefresh')}</p>
        </div>
      </div>
    </div>
  );
}
