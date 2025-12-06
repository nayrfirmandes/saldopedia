// Calculator utilities for rate calculations
import { PAYPAL_SKRILL_RATES, CRYPTO_CONFIG, SYMBOL_TO_ID, LIMITS } from './rates';

export type ServiceType = 'cryptocurrency' | 'paypal' | 'skrill';
export type ModeType = 'convert' | 'topup';

// Get PayPal/Skrill rate based on amount and mode
export function getPayPalSkrillRate(amount: number, mode: ModeType): number {
  const tiers = PAYPAL_SKRILL_RATES[mode];
  
  for (const tier of tiers) {
    if (amount >= tier.min && amount <= tier.max) {
      return tier.rate;
    }
  }
  
  // Return highest tier rate if amount exceeds all tiers
  return tiers[tiers.length - 1].rate;
}

// Calculate PayPal/Skrill transaction
export function calculatePayPalSkrill(amount: number, mode: ModeType): {
  rate: number;
  totalIDR: number;
  valid: boolean;
  error?: string;
} {
  // Validation
  if (amount < LIMITS.paypal.min_usd) {
    return {
      rate: 0,
      totalIDR: 0,
      valid: false,
      error: `Minimal transaksi $${LIMITS.paypal.min_usd}`
    };
  }
  
  if (amount > LIMITS.paypal.max_usd) {
    return {
      rate: 0,
      totalIDR: 0,
      valid: false,
      error: `Maksimal transaksi $${LIMITS.paypal.max_usd.toLocaleString('id-ID')}`
    };
  }
  
  const rate = getPayPalSkrillRate(amount, mode);
  const totalIDR = amount * rate;
  
  return {
    rate,
    totalIDR,
    valid: true
  };
}

// Get crypto rate with margin
export function getCryptoRate(symbol: string, marketPriceIDR: number, mode: ModeType): number {
  // Check if stablecoin
  if (CRYPTO_CONFIG.stablecoins[symbol]) {
    return CRYPTO_CONFIG.stablecoins[symbol][mode];
  }
  
  // Apply margin
  const margin = mode === 'convert' 
    ? CRYPTO_CONFIG.margin_convert 
    : CRYPTO_CONFIG.margin_topup;
  
  return marketPriceIDR * margin;
}

// Calculate crypto transaction (from IDR amount)
export function calculateCryptoFromIDR(
  symbol: string,
  amountIDR: number,
  marketPriceIDR: number,
  mode: ModeType = 'topup'
): {
  rate: number;
  cryptoAmount: number;
  valid: boolean;
  error?: string;
} {
  // Validation - use min_idr_buy for topup mode (customer buys crypto)
  const minIDR = mode === 'topup' ? LIMITS.crypto.min_idr_buy : LIMITS.crypto.min_idr_sell;
  
  if (amountIDR < minIDR) {
    return {
      rate: 0,
      cryptoAmount: 0,
      valid: false,
      error: `Minimal transaksi Rp ${minIDR.toLocaleString('id-ID')}`
    };
  }
  
  const rate = getCryptoRate(symbol, marketPriceIDR, mode);
  const cryptoAmount = amountIDR / rate;
  
  return {
    rate,
    cryptoAmount,
    valid: true
  };
}

// Calculate crypto transaction (from crypto amount)
export function calculateCryptoFromCoin(
  symbol: string,
  cryptoAmount: number,
  marketPriceIDR: number,
  mode: ModeType = 'convert'
): {
  rate: number;
  totalIDR: number;
  valid: boolean;
  error?: string;
} {
  const rate = getCryptoRate(symbol, marketPriceIDR, mode);
  const totalIDR = cryptoAmount * rate;
  
  // Validation - use min_idr_sell for convert mode (customer sells crypto)
  const minIDR = mode === 'convert' ? LIMITS.crypto.min_idr_sell : LIMITS.crypto.min_idr_buy;
  
  if (totalIDR < minIDR) {
    return {
      rate,
      totalIDR,
      valid: false,
      error: `Minimal transaksi Rp ${minIDR.toLocaleString('id-ID')}`
    };
  }
  
  return {
    rate,
    totalIDR,
    valid: true
  };
}

export { formatIDR, formatUSD, formatCrypto } from './formatters';

// Format rate (handle small values for crypto)
export function formatRate(value: number): string {
  if (value === 0) return '0';
  
  // Very small values (< 1): show up to 8 decimals without trailing zeros
  if (value < 1) {
    return value.toFixed(8).replace(/\.?0+$/, '');
  }
  
  // Small values (< 1000): show 2 decimals
  if (value < 1000) {
    return value.toFixed(2);
  }
  
  // Large values: format as integer with thousand separators
  return Math.round(value).toLocaleString('id-ID');
}

// Get tier information for display
export function getTierInfo(amount: number, mode: ModeType): {
  tierLabel: string;
  tierName: 'basic' | 'pro' | 'premium' | 'gold';
  tierRate: number;
} | null {
  const tiers = PAYPAL_SKRILL_RATES[mode];
  const tierNames: ('basic' | 'pro' | 'premium' | 'gold')[] = ['basic', 'pro', 'premium', 'gold'];
  
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    if (amount >= tier.min && amount <= tier.max) {
      return {
        tierLabel: `$${tier.min.toLocaleString('en-US')} - $${tier.max.toLocaleString('en-US')}`,
        tierName: tierNames[i],
        tierRate: tier.rate
      };
    }
  }
  
  return null;
}

// Calculate minimum coin amount needed for crypto convert/jual mode
// with safety tolerance to ensure transaction meets minimum IDR requirement
export function getMinimumCoinAmount(
  symbol: string,
  marketPriceIDR: number,
  mode: ModeType = 'convert'
): number {
  const rate = getCryptoRate(symbol, marketPriceIDR, mode);
  const minIDR = mode === 'convert' ? LIMITS.crypto.min_idr_sell : LIMITS.crypto.min_idr_buy;
  const minCoin = minIDR / rate;
  
  // Add 10% safety tolerance to ensure we always meet minimum
  const minCoinWithTolerance = minCoin * 1.1;
  
  return minCoinWithTolerance;
}
