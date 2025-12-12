import { SYMBOL_TO_ID } from "./rates";

const COIN_IDS = Object.values(SYMBOL_TO_ID);

export type PriceSnapshot = {
  [key: string]: { idr: number; idr_24h_change: number };
};

const FALLBACK_PRICES: PriceSnapshot = {
  "bitcoin": { idr: 1503000000, idr_24h_change: 1.5 },
  "ethereum": { idr: 51800000, idr_24h_change: 2.1 },
  "tether": { idr: 16700, idr_24h_change: 0.01 },
  "usd-coin": { idr: 16700, idr_24h_change: 0.02 },
  "binancecoin": { idr: 14800000, idr_24h_change: 1.8 },
  "solana": { idr: 2210000, idr_24h_change: 3.2 },
  "ripple": { idr: 34300, idr_24h_change: 2.5 },
  "cardano": { idr: 7100, idr_24h_change: 1.2 },
  "dogecoin": { idr: 2340, idr_24h_change: 4.1 },
  "tron": { idr: 4700, idr_24h_change: 1.1 },
  "polygon-ecosystem-token": { idr: 2040, idr_24h_change: 2.8 },
  "the-open-network": { idr: 27000, idr_24h_change: 3.5 },
  "shiba-inu": { idr: 0.142, idr_24h_change: 5.2 },
  "pancakeswap-token": { idr: 38100, idr_24h_change: 1.9 },
  "floki": { idr: 0.82, idr_24h_change: 6.1 },
  "tokocrypto": { idr: 1580, idr_24h_change: 0.8 },
  "baby-doge-coin": { idr: 0.0000114, idr_24h_change: 7.3 },
  "dogs-2": { idr: 0.8, idr_24h_change: 4.5 },
  "notcoin": { idr: 10, idr_24h_change: 3.8 },
};

let priceCache: {
  data: PriceSnapshot | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

let pendingFetch: Promise<PriceSnapshot> | null = null;

const CACHE_TTL_MS = 180000;

async function fetchCoinGeckoPrices(): Promise<PriceSnapshot> {
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
  
  const transformedData: PriceSnapshot = {};
  for (const [coinId, coinData] of Object.entries(rawData)) {
    const data = coinData as any;
    transformedData[coinId] = {
      idr: data.idr || 0,
      idr_24h_change: data.idr_24h_change || 0
    };
  }
  
  return transformedData;
}

export async function getSnapshot(): Promise<PriceSnapshot> {
  const now = Date.now();
  const cacheAge = now - priceCache.timestamp;

  if (priceCache.data && cacheAge < CACHE_TTL_MS) {
    return priceCache.data;
  }

  if (pendingFetch) {
    if (priceCache.data) {
      return priceCache.data;
    }
    return FALLBACK_PRICES;
  }

  pendingFetch = (async () => {
    try {
      const freshData = await fetchCoinGeckoPrices();
      priceCache = {
        data: freshData,
        timestamp: now
      };
      return freshData;
    } catch (error) {
      console.warn('CoinGecko fetch failed, using fallback:', error);
      if (priceCache.data) {
        return priceCache.data;
      }
      return FALLBACK_PRICES;
    } finally {
      pendingFetch = null;
    }
  })();

  if (priceCache.data) {
    return priceCache.data;
  }
  
  return FALLBACK_PRICES;
}

export function getInstantSnapshot(): PriceSnapshot {
  return priceCache.data || FALLBACK_PRICES;
}

export async function refreshSnapshot(): Promise<PriceSnapshot> {
  priceCache.timestamp = 0;
  return await getSnapshot();
}

export function getLastGoodSnapshot(): PriceSnapshot | null {
  return priceCache.data;
}
