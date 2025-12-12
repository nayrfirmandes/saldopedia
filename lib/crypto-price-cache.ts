import { COIN_IDS, SYMBOL_TO_ID, CRYPTO_CONFIG } from './rates';

// In-memory cache shared with API route
let priceCache: {
  data: { [key: string]: { idr: number; idr_24h_change: number } } | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

// In-flight fetch guard to prevent concurrent CoinGecko calls
let pendingFetch: Promise<{ [key: string]: { idr: number; idr_24h_change: number } }> | null = null;

const CACHE_TTL_MS = 180000; // 3 minutes

// Fetch fresh data from CoinGecko
async function fetchCoinGeckoPrices() {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS.join(',')}&vs_currencies=idr&include_24hr_change=true`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SaldopediaBot/1.0 (+https://saldopedia.com)'
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const rawData = await response.json();
  
  const transformedData: { [key: string]: { idr: number; idr_24h_change: number } } = {};
  for (const [coinId, coinData] of Object.entries(rawData)) {
    const data = coinData as any;
    transformedData[coinId] = {
      idr: data.idr || 0,
      idr_24h_change: data.idr_24h_change || 0
    };
  }
  
  return transformedData;
}

// Get cached prices or fetch if stale
export async function getCryptoPrices(): Promise<{ [key: string]: { idr: number; idr_24h_change: number } }> {
  const now = Date.now();
  const cacheAge = now - priceCache.timestamp;

  // Return cached data if fresh
  if (priceCache.data && cacheAge < CACHE_TTL_MS) {
    return priceCache.data;
  }

  // If a fetch is already in progress, wait for it
  if (pendingFetch) {
    return await pendingFetch;
  }

  // Start new fetch and store the promise
  pendingFetch = (async () => {
    try {
      const freshData = await fetchCoinGeckoPrices();
      priceCache = {
        data: freshData,
        timestamp: now
      };
      return freshData;
    } catch (error) {
      // Return stale cache on error, or throw if no cache
      if (priceCache.data) {
        return priceCache.data;
      }
      throw error;
    } finally {
      // Clear pending fetch after completion
      pendingFetch = null;
    }
  })();

  return await pendingFetch;
}

// Get price for a specific crypto symbol with spread applied
export async function getCryptoPriceWithSpread(
  symbol: string, 
  transactionType: 'buy' | 'sell'
): Promise<number> {
  const prices = await getCryptoPrices();
  const coinId = SYMBOL_TO_ID[symbol];
  
  if (!coinId || !prices[coinId]) {
    throw new Error(`Price not found for ${symbol}`);
  }

  const basePrice = prices[coinId].idr;
  
  // USDT uses fixed rates
  if (symbol === 'USDT') {
    return transactionType === 'sell' 
      ? CRYPTO_CONFIG.stablecoins.USDT.convert 
      : CRYPTO_CONFIG.stablecoins.USDT.topup;
  }

  // Apply 5% spread
  const spread = transactionType === 'sell' 
    ? CRYPTO_CONFIG.margin_convert 
    : CRYPTO_CONFIG.margin_topup;
    
  return basePrice * spread;
}
