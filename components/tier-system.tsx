'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Target, Zap, TrendingUp } from 'lucide-react';

interface RateTier {
  min: number;
  max: number;
  rate: number;
}

interface DynamicRates {
  paypalRates: { convert: RateTier[]; topup: RateTier[] };
  skrillRates: { convert: RateTier[]; topup: RateTier[] };
}

function formatRate(rate: number): string {
  return `Rp ${rate.toLocaleString('id-ID')}`;
}

function formatTierRange(min: number, max: number): string {
  return `$${min.toLocaleString('en-US')} - $${max.toLocaleString('en-US')}`;
}

export default function TierSystem() {
  const { t } = useLanguage();
  const [rates, setRates] = useState<DynamicRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState<'paypal' | 'skrill'>('paypal');

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('/api/rates');
        const data = await response.json();
        if (data.success) {
          setRates({
            paypalRates: data.paypalRates,
            skrillRates: data.skrillRates,
          });
        }
      } catch (error) {
        console.error('Failed to fetch rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const tierStyles = [
    {
      key: 'basic',
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50',
      borderColor: 'border-gray-200 dark:border-gray-700'
    },
    {
      key: 'pro',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    {
      key: 'premium',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      borderColor: 'border-purple-200 dark:border-purple-700'
    },
    {
      key: 'gold',
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700'
    }
  ];

  const howItWorksSteps = [
    { key: 'step1', Icon: Target },
    { key: 'step2', Icon: Zap },
    { key: 'step3', Icon: TrendingUp }
  ];

  const getTierData = (index: number) => {
    if (!rates) {
      return { 
        range: '...', 
        sellRate: '...', 
        buyRate: '...'
      };
    }
    
    const ratesData = activeService === 'paypal' ? rates.paypalRates : rates.skrillRates;
    
    if (!ratesData.convert[index]) {
      return { range: '...', sellRate: '...', buyRate: '...' };
    }
    
    const sellTier = ratesData.convert[index];
    const buyTier = ratesData.topup[index];
    
    return {
      range: formatTierRange(sellTier.min, sellTier.max),
      sellRate: formatRate(sellTier.rate),
      buyRate: formatRate(buyTier.rate),
    };
  };

  const LoadingSkeleton = () => (
    <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
  );

  return (
    <section className="relative bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          
          <div className="mx-auto max-w-3xl pb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl dark:text-gray-100">
              {t('pricing.tierSystem.sectionTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('pricing.tierSystem.sectionSubtitle')}
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                onClick={() => setActiveService('paypal')}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeService === 'paypal'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061Z"/>
                </svg>
                PayPal
              </button>
              <button
                onClick={() => setActiveService('skrill')}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeService === 'skrill'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-gray-700 dark:text-purple-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
                Skrill
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {tierStyles.map((tier, index) => {
              const tierData = getTierData(index);
              return (
                <div
                  key={tier.key}
                  className={`relative rounded-xl border ${tier.borderColor} bg-gradient-to-br ${tier.bgGradient} p-5 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
                >
                  <div className="mb-4">
                    <div className={`inline-block rounded-full bg-gradient-to-r ${tier.gradient} px-3 py-1 text-xs font-semibold text-white mb-2`}>
                      {t(`pricing.tierSystem.${tier.key}.badge`)}
                    </div>
                    <h3 className="text-2xl font-bold dark:text-gray-100">
                      {t(`pricing.tierSystem.${tier.key}.title`)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {loading ? '...' : tierData.range}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {t(`pricing.tierSystem.${tier.key}.description`)}
                  </p>

                  <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pricing.tierSystem.sellLabel')}</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {loading ? <LoadingSkeleton /> : `${tierData.sellRate}/USD`}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pricing.tierSystem.buyLabel')}</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {loading ? <LoadingSkeleton /> : `${tierData.buyRate}/USD`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-900 dark:from-indigo-950/30 dark:to-purple-950/30">
            <h3 className="mb-6 text-center text-xl font-bold dark:text-gray-100">
              {t('pricing.tierSystem.howItWorks.title')}
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              {howItWorksSteps.map((step) => {
                const IconComponent = step.Icon;
                return (
                  <div key={step.key} className="text-center">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-800">
                      <IconComponent className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="mb-2 font-semibold dark:text-gray-100">
                      {t(`pricing.tierSystem.howItWorks.${step.key}.title`)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(`pricing.tierSystem.howItWorks.${step.key}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{t('pricing.tierSystem.note')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
