"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageIllustration from "@/components/page-illustration";
import { useLanguage } from "@/contexts/language-context";

interface RateTier {
  min: number;
  max: number;
  rate: number;
}

interface CryptoConfig {
  margin_convert: number;
  margin_topup: number;
  stablecoins: {
    [key: string]: {
      convert: number;
      topup: number;
    };
  };
}

interface DynamicRates {
  cryptoConfig: CryptoConfig;
  paypalRates: { convert: RateTier[]; topup: RateTier[] };
  skrillRates: { convert: RateTier[]; topup: RateTier[] };
}

function formatRate(rate: number): string {
  return `Rp ${rate.toLocaleString('id-ID')}`;
}

function formatTierRange(min: number, max: number): string {
  return `$${min.toLocaleString('en-US')} - $${max.toLocaleString('en-US')}`;
}

function formatMarginPercent(margin: number): string {
  const percent = Math.abs((margin - 1) * 100);
  const sign = margin < 1 ? '-' : '+';
  return `${sign}${percent.toFixed(0)}%`;
}

export default function PricingTables() {
  const { t } = useLanguage();
  const [serviceType, setServiceType] = useState<"jual" | "beli">("jual");
  const [rates, setRates] = useState<DynamicRates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('/api/rates');
        const data = await response.json();
        if (data.success) {
          setRates({
            cryptoConfig: data.cryptoConfig,
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

  const renderTierRates = (tiers: RateTier[], colorClass: string) => {
    const tierColors = [
      'text-gray-900 dark:text-gray-100',
      colorClass,
      'text-emerald-600 dark:text-emerald-400',
      'text-emerald-700 dark:text-emerald-400'
    ];

    return (
      <div className="space-y-1.5">
        {tiers.map((tier, index) => (
          <div key={index} className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatTierRange(tier.min, tier.max)}
            </span>
            <span className={`text-lg font-bold ${tierColors[index] || tierColors[0]}`}>
              {formatRate(tier.rate)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-1.5 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-baseline justify-between">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  const cryptoMarginSell = rates?.cryptoConfig.margin_convert || 0.95;
  const cryptoMarginBuy = rates?.cryptoConfig.margin_topup || 1.05;

  return (
    <section className="relative">
      <PageIllustration />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          <div className="pb-12 text-center">
            <h1 className="mb-4 py-2 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-700/.8),transparent)1] md:text-5xl dark:text-gray-100">
              {t('pricing.hero.title')}
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {t('pricing.hero.subtitle')}
              </p>
            </div>
          </div>

          <div>
            <div className="m-auto mb-16 flex max-w-md justify-center">
              <div className="relative mx-6 flex w-full rounded-lg bg-gray-200 p-1 dark:bg-gray-700">
                <span
                  className="pointer-events-none absolute inset-0 m-1"
                  aria-hidden="true"
                >
                  <span
                    className={`absolute inset-0 w-1/2 transform rounded-sm bg-white shadow-sm transition-transform duration-150 ease-in-out dark:bg-gray-800 ${serviceType === "jual" ? "translate-x-0" : "translate-x-full"}`}
                  ></span>
                </span>
                <button
                  className={`relative flex-1 p-2 text-sm font-medium transition ${serviceType === "jual" ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                  onClick={() => setServiceType("jual")}
                  aria-pressed={serviceType === "jual"}
                >
                  {t('pricing.toggle.sell')}
                </button>
                <button
                  className={`relative flex-1 p-2 text-sm font-medium transition ${serviceType === "beli" ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                  onClick={() => setServiceType("beli")}
                  aria-pressed={serviceType === "beli"}
                >
                  {t('pricing.toggle.buy')}
                </button>
              </div>
            </div>

            <div className="mx-auto grid max-w-sm items-start gap-4 md:max-w-3xl md:grid-cols-3">
              <div className="relative flex h-full flex-col rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 p-5 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xl font-bold text-gray-200">{t('pricing.crypto.title')}</div>
                    <div className="flex gap-1.5">
                      <svg className="h-6 w-6 text-orange-400" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>
                      </svg>
                      <svg className="h-6 w-6 text-blue-400" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M15.927 23.959l-9.823-5.797 9.817 13.839 9.828-13.839-9.828 5.797zM16.073 0l-9.819 16.297 9.819 5.807 9.823-5.801z"/>
                      </svg>
                      <svg className="h-6 w-6 text-green-400" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm1.922-18.207v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="mb-4 border-b border-dashed border-gray-600 pb-4">
                    {serviceType === "jual" ? (
                      <div>
                        <div className="mb-2 text-sm text-gray-400">{t('pricing.crypto.sellRate')}</div>
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-emerald-400">{t('pricing.crypto.marketPrice')}</span>
                        </div>
                        <div className="mt-1 text-xl font-semibold text-gray-300">
                          {loading ? '...' : formatMarginPercent(cryptoMarginSell)} dari harga pasar
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2 text-sm text-gray-400">{t('pricing.crypto.buyRate')}</div>
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-blue-400">{t('pricing.crypto.marketPrice')}</span>
                        </div>
                        <div className="mt-1 text-xl font-semibold text-gray-300">
                          {loading ? '...' : formatMarginPercent(cryptoMarginBuy)} dari harga pasar
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {t('pricing.crypto.description')}
                  </div>
                </div>
                <ul className="grow space-y-2.5 text-sm text-gray-400">
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.crypto.feature1')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.crypto.feature2')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.crypto.feature3')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.crypto.feature4')}</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    className="btn-sm group w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] py-2 text-white shadow-sm hover:bg-[length:100%_150%]"
                    href="/order"
                  >
                    <span className="relative inline-flex items-center">
                      {t('pricing.cta.button')}{" "}
                      <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                        -&gt;
                      </span>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="relative flex h-full flex-col rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/80 p-5 shadow-md transition-all duration-200 hover:shadow-lg dark:border-blue-800/30 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('pricing.paypal.title')}</div>
                    <svg
                      className="h-7 w-7 text-blue-600"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z"/>
                    </svg>
                  </div>
                  <div className="mb-4 border-b border-dashed border-gray-200 pb-4 dark:border-gray-700">
                    {serviceType === "jual" ? (
                      <div>
                        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t('pricing.paypal.sellRate')}</div>
                        {loading ? renderLoadingSkeleton() : 
                          rates?.paypalRates.convert && renderTierRates(rates.paypalRates.convert, 'text-blue-600 dark:text-blue-400')
                        }
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t('pricing.paypal.buyRate')}</div>
                        {loading ? renderLoadingSkeleton() : 
                          rates?.paypalRates.topup && renderTierRates(rates.paypalRates.topup, 'text-blue-600 dark:text-blue-400')
                        }
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {t('pricing.paypal.description')}
                  </div>
                </div>
                <ul className="grow space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.paypal.feature1')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.paypal.feature2')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.paypal.feature3')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.paypal.feature4')}</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    className="btn-sm group w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] py-2 text-white shadow-sm hover:bg-[length:100%_150%]"
                    href="/order"
                  >
                    <span className="relative inline-flex items-center">
                      {t('pricing.cta.button')}{" "}
                      <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                        -&gt;
                      </span>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="relative flex h-full flex-col rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/80 p-5 shadow-md transition-all duration-200 hover:shadow-lg dark:border-purple-800/30 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('pricing.skrill.title')}</div>
                    <svg
                      className="h-7 w-7 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      <path d="M7 15h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
                    </svg>
                  </div>
                  <div className="mb-4 border-b border-dashed border-gray-200 pb-4 dark:border-gray-700">
                    {serviceType === "jual" ? (
                      <div>
                        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t('pricing.skrill.sellRate')}</div>
                        {loading ? renderLoadingSkeleton() : 
                          rates?.skrillRates.convert && renderTierRates(rates.skrillRates.convert, 'text-purple-600 dark:text-purple-400')
                        }
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t('pricing.skrill.buyRate')}</div>
                        {loading ? renderLoadingSkeleton() : 
                          rates?.skrillRates.topup && renderTierRates(rates.skrillRates.topup, 'text-purple-600 dark:text-purple-400')
                        }
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {t('pricing.skrill.description')}
                  </div>
                </div>
                <ul className="grow space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.skrill.feature1')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.skrill.feature2')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.skrill.feature3')}</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2.5 h-3 w-3 shrink-0 fill-current text-emerald-500"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span>{t('pricing.skrill.feature4')}</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    className="btn-sm group w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] py-2 text-white shadow-sm hover:bg-[length:100%_150%]"
                    href="/order"
                  >
                    <span className="relative inline-flex items-center">
                      {t('pricing.cta.button')}{" "}
                      <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                        -&gt;
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
