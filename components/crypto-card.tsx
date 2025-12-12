'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';

interface CryptoCardProps {
  coinId: string;
  symbol: string;
  name: string;
  logoPath: string;
  price: number | null;
  change24h: number | null;
  minCoin: string;
  isStablecoin: boolean;
  badge?: boolean;
}

export default function CryptoCard({
  coinId,
  symbol,
  name,
  logoPath,
  price,
  change24h,
  minCoin,
  isStablecoin,
  badge,
}: CryptoCardProps) {
  const { t } = useLanguage();
  const isPositive = change24h !== null && change24h >= 0;
  const isLoading = price === null;

  return (
    <div className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md md:p-5 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-500/40">
      {/* Badge */}
      {badge && (
        <div className="absolute right-3 top-3 md:right-4 md:top-4">
          <span className="rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 px-2 py-0.5 text-xs font-medium text-white md:px-2.5">
            {t("cryptoPage.card.badge")}
          </span>
        </div>
      )}

      {/* Icon & Name */}
      <div className="mb-3 flex items-start gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm dark:bg-gray-700">
          <Image
            src={logoPath}
            alt={`${name} logo`}
            width={40}
            height={40}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 md:text-base dark:text-gray-100">{name}</h3>
          <p className="text-xs text-gray-500 md:text-sm dark:text-gray-400">{symbol}</p>
        </div>
      </div>

      {/* Price & Change */}
      <div className="mb-3 space-y-2 md:mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("cryptoPage.card.currentPrice")}</p>
          {isLoading ? (
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200 md:h-6 md:w-32 dark:bg-gray-700"></div>
          ) : (
            <p className="text-base font-bold text-gray-900 md:text-lg dark:text-gray-100">
              Rp {price && price < 0.01 
                ? price.toFixed(8).replace(/\.?0+$/, '') 
                : price?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }
            </p>
          )}
        </div>

        {!isStablecoin && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("cryptoPage.card.change24h")}</p>
            {isLoading ? (
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200 md:h-5 md:w-20 dark:bg-gray-700"></div>
            ) : (
              <p
                className={`text-xs font-semibold md:text-sm ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '▲' : '▼'} {Math.abs(change24h || 0).toFixed(2)}%
              </p>
            )}
          </div>
        )}
      </div>

      {/* Min Transaction */}
      <div className="mb-3 rounded-lg bg-gray-50 p-2.5 md:mb-4 md:p-3 dark:bg-gray-900/50">
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{t("cryptoPage.card.minTransaction")}</p>
        {isLoading ? (
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 md:h-5 md:w-28 dark:bg-gray-700"></div>
        ) : (
          <p className="text-xs font-semibold text-gray-900 md:text-sm dark:text-gray-100">
            ~{minCoin} {symbol}
          </p>
        )}
      </div>

      {/* CTA Button */}
      <Link
        href={`/calculator?tab=crypto&coin=${symbol}`}
        className="group/btn flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-tr from-orange-500 to-yellow-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md md:text-sm dark:from-orange-600 dark:to-yellow-600"
      >
        {t("cryptoPage.card.calculateButton")}
        <span className="transition-transform group-hover/btn:translate-x-0.5">
          →
        </span>
      </Link>
    </div>
  );
}
