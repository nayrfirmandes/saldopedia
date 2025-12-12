import { NextResponse } from 'next/server';
import { COIN_IDS, CACHE_TTL_SECONDS } from '@/lib/rates';

// In-memory cache
let priceCache: {
  data: { [key: string]: { idr: number; idr_24h_change: number } } | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

// Fetch fresh data from CoinGecko
async function fetchCoinGeckoPrices() {
  // Include 24h change data
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS.join(',')}&vs_currencies=idr&include_24hr_change=true`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SaldopediaBot/1.0 (+https://saldopedia.com)'
    },
    next: { revalidate: 0 } // Disable Next.js caching
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const rawData = await response.json();
  
  // Transform CoinGecko response to our format
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

export async function GET() {
  try {
    const now = Date.now();
    const cacheAge = (now - priceCache.timestamp) / 1000; // in seconds

    // Return cached data if still fresh (< 180 seconds)
    if (priceCache.data && cacheAge < CACHE_TTL_SECONDS) {
      return NextResponse.json({
        success: true,
        prices: priceCache.data,
        cached: true,
        cacheAge: Math.floor(cacheAge),
        timestamp: priceCache.timestamp
      });
    }

    // Fetch fresh data
    const freshData = await fetchCoinGeckoPrices();
    
    // Update cache
    priceCache = {
      data: freshData,
      timestamp: now
    };

    return NextResponse.json({
      success: true,
      prices: freshData,
      cached: false,
      cacheAge: 0,
      timestamp: now
    });

  } catch (error) {
    // Return stale cache if available, even if expired
    if (priceCache.data) {
      const cacheAge = (Date.now() - priceCache.timestamp) / 1000;
      return NextResponse.json({
        success: true,
        prices: priceCache.data,
        cached: true,
        cacheAge: Math.floor(cacheAge),
        timestamp: priceCache.timestamp,
        error: 'Serving stale cache due to API error'
      }, { status: 200 }); // Return 200 with stale cache
    }

    // No cache available, return error
    return NextResponse.json(
      { success: false, error: 'Failed to fetch crypto prices and no cache available' },
      { status: 500 }
    );
  }
}
