// Rate configuration for Saldopedia platform
// Cryptocurrency, PayPal, and Skrill rate tiers

export interface RateTier {
  min: number;
  max: number;
  rate: number;
}

export interface CryptoConfig {
  margin_convert: number;
  margin_topup: number;
  stablecoins: {
    [key: string]: {
      convert: number;
      topup: number;
    };
  };
}

// PayPal/Skrill rate tiers (both services have identical rates)
export const PAYPAL_SKRILL_RATES = {
  convert: [
    { min: 20, max: 49, rate: 12000 },
    { min: 50, max: 499, rate: 14000 },
    { min: 500, max: 1999, rate: 15000 },
    { min: 2000, max: 5000, rate: 15299 }
  ] as RateTier[],
  topup: [
    { min: 20, max: 49, rate: 17699 },
    { min: 50, max: 499, rate: 17299 },
    { min: 500, max: 1999, rate: 16999 },
    { min: 2000, max: 5000, rate: 16789 }
  ] as RateTier[]
};

// Crypto configuration
export const CRYPTO_CONFIG: CryptoConfig = {
  margin_convert: 0.95,  // -5% for jual/convert
  margin_topup: 1.05,    // +5% for beli/topup
  stablecoins: {
    USDT: { convert: 14000, topup: 16999 },
    USDC: { convert: 14000, topup: 16999 }
  }
};

// Supported cryptocurrencies for Saldopedia platform
// nowpayments: Symbol used in NOWPayments API
export const SUPPORTED_CRYPTOS = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin', nowpayments: 'btc' },
  ethereum: { symbol: 'ETH', name: 'Ethereum', nowpayments: 'eth' },
  binancecoin: { symbol: 'BNB', name: 'BNB', nowpayments: 'bnbbsc' },
  solana: { symbol: 'SOL', name: 'Solana', nowpayments: 'sol' },
  tron: { symbol: 'TRX', name: 'Tron', nowpayments: 'trx' },
  'the-open-network': { symbol: 'TON', name: 'TON', nowpayments: 'ton' },
  ripple: { symbol: 'XRP', name: 'XRP', nowpayments: 'xrp' },
  tokocrypto: { symbol: 'TKO', name: 'Tokocrypto', nowpayments: 'tko' },
  'polygon-ecosystem-token': { symbol: 'MATIC', name: 'Polygon', nowpayments: 'matic' },
  cardano: { symbol: 'ADA', name: 'Cardano', nowpayments: 'ada' },
  'shiba-inu': { symbol: 'SHIB', name: 'Shiba Inu', nowpayments: 'shib' },
  'baby-doge-coin': { symbol: 'BABYDOGE', name: 'Baby Doge', nowpayments: 'babydoge' },
  'pancakeswap-token': { symbol: 'CAKE', name: 'PancakeSwap', nowpayments: 'cake' },
  floki: { symbol: 'FLOKI', name: 'Floki', nowpayments: 'floki' },
  'dogs-2': { symbol: 'DOGS', name: 'DOGS', nowpayments: 'dogs' },
  notcoin: { symbol: 'NOTCOIN', name: 'Notcoin', nowpayments: 'not' },
  dogecoin: { symbol: 'DOGE', name: 'Dogecoin', nowpayments: 'doge' },
  tether: { symbol: 'USDT', name: 'Tether', nowpayments: 'usdttrc20' },
  'usd-coin': { symbol: 'USDC', name: 'USD Coin', nowpayments: 'usdc' }
};

// Symbol to NOWPayments symbol mapping
export const SYMBOL_TO_NOWPAYMENTS: { [key: string]: string } = Object.entries(SUPPORTED_CRYPTOS).reduce(
  (acc, [, { symbol, nowpayments }]) => ({ ...acc, [symbol]: nowpayments }),
  {}
);

// Get all coin IDs for CoinGecko API
export const COIN_IDS = Object.keys(SUPPORTED_CRYPTOS);

// Get symbol to CoinGecko ID mapping
export const SYMBOL_TO_ID: { [key: string]: string } = Object.entries(SUPPORTED_CRYPTOS).reduce(
  (acc, [id, { symbol }]) => ({ ...acc, [symbol]: id }),
  {}
);

// Validation limits
export const LIMITS = {
  crypto: {
    min_idr_buy: 25000,   // Minimum for buying crypto (customer pays IDR)
    min_idr_sell: 50000,  // Minimum for selling crypto (NOWPayments requirement ~$3)
    max_idr: null         // No max limit
  },
  paypal: {
    min_usd: 20,
    max_usd: 5000
  },
  skrill: {
    min_usd: 20,
    max_usd: 5000
  }
};

// Cache TTL for crypto price updates (3 minutes)
export const CACHE_TTL_SECONDS = 180;
