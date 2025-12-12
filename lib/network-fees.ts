// Network fee configuration for crypto transactions
// Fees are estimated in IDR and can be updated via admin dashboard

import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./db-url";

export interface NetworkFeeConfig {
  [symbol: string]: {
    [network: string]: number; // Fee in IDR
  };
}

// Default network fees in IDR (estimates based on typical blockchain costs)
// These are conservative estimates to ensure profitability
export const DEFAULT_NETWORK_FEES: NetworkFeeConfig = {
  BTC: {
    'Bitcoin': 50000,
  },
  ETH: {
    'Ethereum (ERC-20)': 75000,
  },
  BNB: {
    'BSC (BEP-20)': 5000,
  },
  SOL: {
    'Solana': 3000,
  },
  TRX: {
    'Tron (TRC-20)': 3000,
  },
  TON: {
    'TON Network': 5000,
  },
  XRP: {
    'XRP Ledger': 3000,
  },
  TKO: {
    'BSC (BEP-20)': 5000,
  },
  MATIC: {
    'Polygon': 3000,
    'Ethereum (ERC-20)': 75000,
  },
  ADA: {
    'Cardano': 10000,
  },
  SHIB: {
    'Ethereum (ERC-20)': 75000,
    'BSC (BEP-20)': 5000,
  },
  BABYDOGE: {
    'BSC (BEP-20)': 5000,
  },
  CAKE: {
    'BSC (BEP-20)': 5000,
  },
  FLOKI: {
    'Ethereum (ERC-20)': 75000,
    'BSC (BEP-20)': 5000,
  },
  DOGS: {
    'TON Network': 5000,
  },
  NOTCOIN: {
    'TON Network': 5000,
  },
  DOGE: {
    'Dogecoin': 10000,
  },
  USDT: {
    'TRC-20 (Tron)': 3000,
    'BSC (BEP-20)': 5000,
    'Ethereum (ERC-20)': 75000,
    'Solana': 3000,
  },
  USDC: {
    'Ethereum (ERC-20)': 75000,
    'BSC (BEP-20)': 5000,
    'Solana': 3000,
    'Polygon': 3000,
  },
};

// Cache for dynamic fees from database
let networkFeesCache: NetworkFeeConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export async function getNetworkFees(): Promise<NetworkFeeConfig> {
  const now = Date.now();
  
  if (networkFeesCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return networkFeesCache;
  }

  try {
    // Try to fetch from database
    const sql = neon(getDatabaseUrl());
    const result = await sql`SELECT setting_value FROM rate_settings WHERE setting_key = 'network_fees'`;
    
    if (result.length > 0 && result[0].setting_value) {
      try {
        const fees = JSON.parse(result[0].setting_value as string);
        networkFeesCache = fees;
        cacheTimestamp = now;
        return fees;
      } catch {
        // Invalid JSON, use defaults
      }
    }
  } catch (error) {
    console.error('Error fetching network fees from database:', error);
  }

  // Return defaults if database fetch fails
  networkFeesCache = DEFAULT_NETWORK_FEES;
  cacheTimestamp = now;
  return DEFAULT_NETWORK_FEES;
}

export function getNetworkFee(
  symbol: string,
  network: string,
  fees: NetworkFeeConfig = DEFAULT_NETWORK_FEES
): number {
  const symbolFees = fees[symbol];
  if (!symbolFees) {
    return 25000; // Default fallback fee
  }
  
  const networkFee = symbolFees[network];
  if (networkFee !== undefined) {
    return networkFee;
  }
  
  // Try to find a matching network (partial match)
  const matchingNetwork = Object.keys(symbolFees).find(n => 
    network.toLowerCase().includes(n.toLowerCase()) ||
    n.toLowerCase().includes(network.toLowerCase())
  );
  
  if (matchingNetwork) {
    return symbolFees[matchingNetwork];
  }
  
  // Return first available fee for this symbol
  const firstFee = Object.values(symbolFees)[0];
  return firstFee || 25000;
}

export function clearNetworkFeesCache(): void {
  networkFeesCache = null;
  cacheTimestamp = 0;
}
