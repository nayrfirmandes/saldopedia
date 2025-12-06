'use client';

import { useLanguage } from '@/contexts/language-context';
import { Target, Zap, TrendingUp } from 'lucide-react';

export default function TierSystem() {
  const { t } = useLanguage();

  const tiers = [
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

  return (
    <section className="relative bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl dark:text-gray-100">
              {t('pricing.tierSystem.sectionTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('pricing.tierSystem.sectionSubtitle')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {tiers.map((tier) => (
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
                    {t(`pricing.tierSystem.${tier.key}.range`)}
                  </p>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t(`pricing.tierSystem.${tier.key}.description`)}
                </p>

                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jual (Sell)</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {t(`pricing.tierSystem.${tier.key}.sellRate`)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Beli (Buy)</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {t(`pricing.tierSystem.${tier.key}.buyRate`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
