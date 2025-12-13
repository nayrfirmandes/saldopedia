"use client";

import { useState, memo, useMemo, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import Image from "next/image";

interface AssetOption {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  category: 'crypto' | 'paypal' | 'skrill';
}

const ALL_ASSETS: AssetOption[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', logo: '/images/crypto/btc.webp', category: 'crypto' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', logo: '/images/crypto/eth.png', category: 'crypto' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', logo: '/images/crypto/bnb.webp', category: 'crypto' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', logo: '/images/crypto/sol.webp', category: 'crypto' },
  { id: 'tether', symbol: 'USDT', name: 'Tether', logo: '/images/crypto/usdt.png', category: 'crypto' },
  { id: 'the-open-network', symbol: 'TON', name: 'TON', logo: '/images/crypto/ton.webp', category: 'crypto' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', logo: '/images/crypto/ada.png', category: 'crypto' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', logo: '/images/crypto/xrp.webp', category: 'crypto' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', logo: '/images/crypto/doge.webp', category: 'crypto' },
  { id: 'tron', symbol: 'TRX', name: 'Tron', logo: '/images/crypto/trx.webp', category: 'crypto' },
  { id: 'paypal', symbol: 'USD', name: 'PayPal', logo: '/images/paypal-logo.png', category: 'paypal' },
  { id: 'skrill', symbol: 'USD', name: 'Skrill', logo: '/images/skrill-logo.png', category: 'skrill' },
];

interface MarketData {
  [coinId: string]: { idr: number; idr_24h_change: number };
}

function formatPrice(price: number): string {
  if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(2)}B`;
  if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(2)}M`;
  return `Rp ${Math.round(price).toLocaleString('id-ID')}`;
}

function generateChartPoints(change: number, seed: number): number[] {
  const pts: number[] = [];
  const volatility = Math.min(Math.abs(change) * 3, 25);
  const isPositive = change >= 0;
  
  for (let i = 0; i < 48; i++) {
    const noise = Math.sin(seed + i * 0.5) * volatility + Math.cos(seed * 2 + i * 0.3) * (volatility * 0.5);
    const trend = isPositive ? (i / 47) * 30 : ((47 - i) / 47) * 30;
    pts.push(50 + noise + (isPositive ? trend - 15 : -trend + 15));
  }
  return pts;
}

function BusinessCategories() {
  const { t } = useLanguage();
  const [selectedAsset, setSelectedAsset] = useState<AssetOption>(ALL_ASSETS[0]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/crypto-rates');
      const json = await res.json();
      if (json.success && json.prices) {
        setMarketData(json.prices);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const currentPrice = useMemo(() => {
    if (selectedAsset.category !== 'crypto') {
      return selectedAsset.id === 'paypal' ? 14000 : 14000;
    }
    return marketData?.[selectedAsset.id]?.idr || 0;
  }, [selectedAsset, marketData]);

  const change24h = useMemo(() => {
    if (selectedAsset.category !== 'crypto') return 0;
    return marketData?.[selectedAsset.id]?.idr_24h_change || 0;
  }, [selectedAsset, marketData]);

  const isPositive = change24h >= 0;
  const color = isPositive ? '#22c55e' : '#ef4444';

  const chartPath = useMemo(() => {
    const seed = selectedAsset.id.charCodeAt(0) * 10 + Math.abs(change24h * 100);
    const points = generateChartPoints(change24h, seed);
    
    const width = 800;
    const height = 200;
    const stepX = width / (points.length - 1);
    
    let d = `M 0 ${height - (points[0] / 100) * height}`;
    for (let i = 1; i < points.length; i++) {
      const x = i * stepX;
      const y = height - (points[i] / 100) * height;
      const prevX = (i - 1) * stepX;
      const prevY = height - (points[i - 1] / 100) * height;
      const cpX = (prevX + x) / 2;
      d += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
    }
    
    const areaD = d + ` L ${width} ${height} L 0 ${height} Z`;
    
    return { line: d, area: areaD };
  }, [selectedAsset.id, change24h]);

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('business.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('business.crypto.description')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {ALL_ASSETS.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                  selectedAsset.id === asset.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Image src={asset.logo} alt={asset.name} width={20} height={20} className="rounded-full" />
                <span>{asset.symbol}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Image src={selectedAsset.logo} alt={selectedAsset.name} width={48} height={48} className="rounded-full" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAsset.name}</h3>
                  <span className="text-gray-500 dark:text-gray-400">{selectedAsset.symbol}</span>
                </div>
              </div>
              
              <div className="text-right">
                {loading && selectedAsset.category === 'crypto' ? (
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(currentPrice)}
                    </div>
                    {selectedAsset.category === 'crypto' && (
                      <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{change24h.toFixed(2)}% (24h)
                      </div>
                    )}
                    {selectedAsset.category !== 'crypto' && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">per USD</div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="relative h-48 md:h-56">
              {loading && selectedAsset.category === 'crypto' ? (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : (
                <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path d={chartPath.area} fill="url(#chartGradient)" />
                  <path d={chartPath.line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              
              <div className="absolute bottom-2 left-2 flex gap-4 text-xs text-gray-400">
                <span>24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(BusinessCategories);
