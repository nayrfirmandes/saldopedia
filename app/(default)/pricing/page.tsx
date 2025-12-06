'use client';

import { useLanguage } from '@/contexts/language-context';
import dynamic from 'next/dynamic';
import TierSystem from "@/components/tier-system";
import TestimonialsGrid from "@/components/testimonials-grid";
import Cta from "@/components/cta-alternative";

const PricingTables = dynamic(() => import("@/components/pricing-tables"), {
  ssr: true,
});

const Faqs = dynamic(() => import("@/components/faqs-02"), {
  ssr: true,
});

export default function Pricing() {
  const { t } = useLanguage();
  
  return (
    <>
      <PricingTables />
      <TierSystem />
      <TestimonialsGrid />
      
      <section className="bg-gray-50 dark:bg-gray-900/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            <div className="mx-auto max-w-3xl pb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl dark:text-gray-100">
                {t('pricing.faq.sectionTitle')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('pricing.faq.sectionSubtitle')}
              </p>
            </div>
            <Faqs />
          </div>
        </div>
      </section>

      <Cta
        className="overflow-hidden"
        heading={t('pricing.cta.title')}
        buttonText={t('pricing.cta.button')}
        buttonLink="/order"
      />
    </>
  );
}
