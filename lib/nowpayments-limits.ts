// NOWPayments Minimum Amount Cache
// Fetches and caches minimum payout/payment amounts from NOWPayments API

import { SYMBOL_TO_NOWPAYMENTS } from './rates';

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

interface MinimumAmountCache {
  [currency: string]: {
    minAmount: number;
    timestamp: number;
  };
}

const minimumCache: MinimumAmountCache = {};

export interface MinimumAmountResult {
  minAmount: number;
  minAmountUSD: number;
  minAmountIDR: number;
  currency: string;
  nowpaymentsCurrency: string;
}

async function fetchMinimumFromAPI(nowpaymentsCurrency: string): Promise<number | null> {
  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      console.error('NOWPAYMENTS_API_KEY not configured');
      return null;
    }

    const response = await fetch(
      `${NOWPAYMENTS_API_URL}/min-amount?currency_from=${nowpaymentsCurrency}&currency_to=${nowpaymentsCurrency}`,
      {
        headers: { 'x-api-key': apiKey },
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) {
      console.error(`NOWPayments min-amount API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.min_amount || null;
  } catch (error) {
    console.error('Error fetching NOWPayments minimum:', error);
    return null;
  }
}

export async function getMinimumAmount(
  symbol: string,
  cryptoPriceUSD: number,
  usdToIdrRate: number = 16000
): Promise<MinimumAmountResult | null> {
  const nowpaymentsCurrency = SYMBOL_TO_NOWPAYMENTS[symbol];
  
  if (!nowpaymentsCurrency) {
    console.error(`No NOWPayments mapping for symbol: ${symbol}`);
    return null;
  }

  const cacheKey = nowpaymentsCurrency;
  const now = Date.now();
  const cached = minimumCache[cacheKey];

  let minAmount: number;

  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    minAmount = cached.minAmount;
  } else {
    const fetchedAmount = await fetchMinimumFromAPI(nowpaymentsCurrency);
    if (fetchedAmount === null) {
      return null;
    }
    minAmount = fetchedAmount;
    minimumCache[cacheKey] = {
      minAmount,
      timestamp: now
    };
  }

  const minAmountUSD = minAmount * cryptoPriceUSD;
  const minAmountIDR = Math.ceil(minAmountUSD * usdToIdrRate);

  return {
    minAmount,
    minAmountUSD,
    minAmountIDR,
    currency: symbol,
    nowpaymentsCurrency
  };
}

export async function getAllMinimumAmounts(
  cryptoPrices: { [symbol: string]: number },
  usdToIdrRate: number = 16000
): Promise<{ [symbol: string]: MinimumAmountResult }> {
  const results: { [symbol: string]: MinimumAmountResult } = {};
  
  const symbols = Object.keys(SYMBOL_TO_NOWPAYMENTS);
  
  await Promise.all(
    symbols.map(async (symbol) => {
      const price = cryptoPrices[symbol];
      if (price) {
        const result = await getMinimumAmount(symbol, price, usdToIdrRate);
        if (result) {
          results[symbol] = result;
        }
      }
    })
  );

  return results;
}

export function validateMinimumAmount(
  symbol: string,
  amountCrypto: number,
  amountIDR: number,
  transactionType: 'buy' | 'sell',
  minimumResult: MinimumAmountResult | null
): { valid: boolean; error?: string; minRequired?: number } {
  if (!minimumResult) {
    return { valid: true };
  }

  if (amountCrypto < minimumResult.minAmount) {
    const minIDR = minimumResult.minAmountIDR;
    return {
      valid: false,
      error: `Minimum ${transactionType === 'buy' ? 'pembelian' : 'penjualan'} ${symbol}: ${minimumResult.minAmount.toFixed(8)} ${symbol} (Rp ${minIDR.toLocaleString('id-ID')})`,
      minRequired: minIDR
    };
  }

  return { valid: true };
}

export function clearMinimumCache(): void {
  Object.keys(minimumCache).forEach(key => delete minimumCache[key]);
}
