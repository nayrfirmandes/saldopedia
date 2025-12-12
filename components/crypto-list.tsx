'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import CryptoCard from '@/components/crypto-card';
import { SUPPORTED_CRYPTOS, CRYPTO_CONFIG } from '@/lib/rates';

// Crypto logo paths mapping
const CRYPTO_LOGOS: { [key: string]: string } = {
  BTC: '/images/crypto/btc.webp',
  ETH: '/images/crypto/eth.png',
  BNB: '/images/crypto/bnb.webp',
  SOL: '/images/crypto/sol.webp',
  USDT: '/images/crypto/usdt.png',
  USDC: '/images/crypto/usdc.png',
  MATIC: '/images/crypto/matic.webp',
  ADA: '/images/crypto/ada.png',
  XRP: '/images/crypto/xrp.webp',
  DOGE: '/images/crypto/doge.webp',
  TRX: '/images/crypto/trx.webp',
  TON: '/images/crypto/ton.webp',
  SHIB: '/images/crypto/shib.webp',
  CAKE: '/images/crypto/cake.webp',
  FLOKI: '/images/crypto/floki.webp',
  TKO: '/images/crypto/tko.webp',
  BABYDOGE: '/images/crypto/babydoge.webp',
  DOGS: '/images/crypto/dogs.webp',
  NOTCOIN: '/images/crypto/notcoin.webp',
};

// Categorize cryptocurrencies
const CATEGORIES = {
  popular: ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'],
  altcoins: ['MATIC', 'ADA', 'XRP', 'DOGE', 'TRX', 'TON', 'SHIB', 'CAKE', 'FLOKI'],
  stablecoins: ['USDT', 'USDC'],
  emerging: ['TKO', 'BABYDOGE', 'DOGS', 'NOTCOIN'],
};

interface CryptoPrices {
  [coinId: string]: {
    idr: number;
    idr_24h_change: number;
  };
}

export default function CryptoList() {
  const { t } = useLanguage();
  const [prices, setPrices] = useState<CryptoPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'popular' | 'altcoins' | 'stablecoins' | 'emerging'>('all');

  useEffect(() => {
    fetchPrices();
    // Refresh every 3 minutes (matching cache TTL)
    const interval = setInterval(fetchPrices, 180000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/crypto-rates');
      const data = await response.json();
      if (data.success) {
        setPrices(data.prices);
        setLastUpdated(data.timestamp || Date.now());
      }
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastUpdatedText = () => {
    if (!lastUpdated) return "";
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " " + t("cryptoPage.info.timezone");
  };

  const calculateMinCoin = (coinId: string, price: number | null): string => {
    if (!price) return '...';
    
    const symbol = SUPPORTED_CRYPTOS[coinId as keyof typeof SUPPORTED_CRYPTOS]?.symbol;
    const isStablecoin = symbol === 'USDT' || symbol === 'USDC';
    
    // For stablecoins, use fixed rate (convert rate)
    const effectivePrice = isStablecoin 
      ? CRYPTO_CONFIG.stablecoins[symbol].convert 
      : price * CRYPTO_CONFIG.margin_convert; // -5% for jual
    
    const minCoin = (25000 * 1.1) / effectivePrice; // 10% safety tolerance
    
    // Format based on coin value
    if (minCoin >= 1) {
      return minCoin.toFixed(2);
    } else if (minCoin >= 0.01) {
      return minCoin.toFixed(4);
    } else if (minCoin >= 0.0001) {
      return minCoin.toFixed(6);
    } else {
      return minCoin.toFixed(8);
    }
  };

  const getCryptosByCategory = () => {
    const allCryptos = Object.entries(SUPPORTED_CRYPTOS);
    
    if (activeCategory === 'all') {
      return allCryptos;
    }
    
    const categorySymbols = CATEGORIES[activeCategory];
    return allCryptos.filter(([_, { symbol }]) => categorySymbols.includes(symbol));
  };

  const cryptosToDisplay = getCryptosByCategory();

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          {/* Category Filter */}
          <div className="mb-8" >
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`btn-sm font-normal shadow-sm transition ${
                  activeCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white dark:from-blue-500 dark:to-blue-600'
                    : 'bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border dark:border-gray-700'
                }`}
              >
                <svg
                  className={`mr-2 ${activeCategory === 'all' ? 'fill-white' : 'fill-gray-400 dark:fill-gray-500'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                >
                  <path d="M6.669.715a1 1 0 0 1-.673 1.244 6.014 6.014 0 0 0-4.037 4.037 1 1 0 0 1-1.917-.571A8.014 8.014 0 0 1 5.425.042a1 1 0 0 1 1.244.673ZM7.71 4.71a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM9.996.042a1 1 0 1 0-.57 1.917 6.014 6.014 0 0 1 4.037 4.037 1 1 0 0 0 1.917-.571A8.015 8.015 0 0 0 9.996.042Zm4.71 8.71a1 1 0 0 1 .674 1.243 8.015 8.015 0 0 1-5.384 5.384 1 1 0 0 1-.57-1.917 6.014 6.014 0 0 0 4.037-4.037 1 1 0 0 1 1.243-.673ZM1.96 9.425a1 1 0 1 0-1.917.57 8.014 8.014 0 0 0 5.383 5.384 1 1 0 0 0 .57-1.917A6.014 6.014 0 0 1 1.96 9.425Z" />
                </svg>
                {t("cryptoPage.categories.all")} (19)
              </button>
              <button
                onClick={() => setActiveCategory('popular')}
                className={`btn-sm font-normal shadow-sm transition ${
                  activeCategory === 'popular'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white dark:from-blue-500 dark:to-blue-600'
                    : 'bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border dark:border-gray-700'
                }`}
              >
                {t("cryptoPage.categories.popular")} (5)
              </button>
              <button
                onClick={() => setActiveCategory('altcoins')}
                className={`btn-sm font-normal shadow-sm transition ${
                  activeCategory === 'altcoins'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white dark:from-blue-500 dark:to-blue-600'
                    : 'bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border dark:border-gray-700'
                }`}
              >
                {t("cryptoPage.categories.altcoins")} (9)
              </button>
              <button
                onClick={() => setActiveCategory('stablecoins')}
                className={`btn-sm font-normal shadow-sm transition ${
                  activeCategory === 'stablecoins'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white dark:from-blue-500 dark:to-blue-600'
                    : 'bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border dark:border-gray-700'
                }`}
              >
                {t("cryptoPage.categories.stablecoins")} (2)
              </button>
              <button
                onClick={() => setActiveCategory('emerging')}
                className={`btn-sm font-normal shadow-sm transition ${
                  activeCategory === 'emerging'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white dark:from-blue-500 dark:to-blue-600'
                    : 'bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border dark:border-gray-700'
                }`}
              >
                {t("cryptoPage.categories.emerging")} (4)
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mb-8 rounded-lg border border-orange-200 bg-orange-50 p-3.5 md:p-4 dark:border-orange-900/30 dark:bg-orange-900/20" >
            <div className="flex items-start gap-2.5">
              <svg className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed text-orange-800 dark:text-orange-200 md:text-sm">
                <strong>{t("cryptoPage.info.title")}</strong> {t("cryptoPage.info.text")} <strong>{t("cryptoPage.info.sellDiscount")}</strong>{t("cryptoPage.info.buyText")} <strong>{t("cryptoPage.info.buyMarkup")}</strong>{t("cryptoPage.info.stablecoin")}
              </p>
            </div>
            {lastUpdated && (
              <div className="mt-2.5 flex items-center justify-end gap-1.5 text-xs text-orange-700 dark:text-orange-300">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t("cryptoPage.info.updateTime")} {getLastUpdatedText()}</span>
              </div>
            )}
          </div>

          {/* Crypto Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1">
                      <div className="mb-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                  <div className="mb-3 space-y-2">
                    <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="h-9 w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"  >
              {cryptosToDisplay.map(([coinId, { symbol, name }], index) => {
                const isStablecoin = symbol === 'USDT' || symbol === 'USDC';
                const isPopular = CATEGORIES.popular.includes(symbol);
                const priceData = prices?.[coinId];
                const price = priceData?.idr || null;
                const change24h = priceData?.idr_24h_change || null;

                return (
                  <CryptoCard
                    key={coinId}
                    coinId={coinId}
                    symbol={symbol}
                    name={name}
                    logoPath={CRYPTO_LOGOS[symbol] || '/images/crypto/btc.png'}
                    price={price}
                    change24h={change24h}
                    minCoin={calculateMinCoin(coinId, price)}
                    isStablecoin={isStablecoin}
                    badge={isPopular}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
