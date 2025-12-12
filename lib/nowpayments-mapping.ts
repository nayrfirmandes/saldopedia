// Mapping dari form input (crypto symbol + network) ke NOWPayments currency codes
// Ref: https://nowpayments.io/supported-coins

export interface CryptoNetworkMapping {
  symbol: string;
  network: string;
  nowpaymentsCode: string;
  requiresTag?: boolean; // For XRP, XLM, EOS, etc
}

export const NOWPAYMENTS_CURRENCY_MAP: CryptoNetworkMapping[] = [
  // Bitcoin
  { symbol: 'BTC', network: 'Bitcoin', nowpaymentsCode: 'btc' },
  
  // Ethereum
  { symbol: 'ETH', network: 'Ethereum (ERC-20)', nowpaymentsCode: 'eth' },
  
  // BNB (only BSC network supported by NOWPayments)
  { symbol: 'BNB', network: 'BSC (BEP-20)', nowpaymentsCode: 'bnbbsc' },
  
  // Solana
  { symbol: 'SOL', network: 'Solana', nowpaymentsCode: 'sol' },
  
  // Tron
  { symbol: 'TRX', network: 'Tron (TRC-20)', nowpaymentsCode: 'trx' },
  
  // TON
  { symbol: 'TON', network: 'TON Network', nowpaymentsCode: 'ton' },
  
  // XRP (requires destination tag)
  { symbol: 'XRP', network: 'XRP Ledger', nowpaymentsCode: 'xrp', requiresTag: true },
  
  // TKO
  { symbol: 'TKO', network: 'BSC (BEP-20)', nowpaymentsCode: 'tko' },
  
  // Polygon (MATIC)
  { symbol: 'MATIC', network: 'Polygon', nowpaymentsCode: 'maticmainnet' },
  { symbol: 'MATIC', network: 'Ethereum (ERC-20)', nowpaymentsCode: 'matic' },
  
  // Cardano
  { symbol: 'ADA', network: 'Cardano', nowpaymentsCode: 'ada' },
  
  // Shiba Inu
  { symbol: 'SHIB', network: 'Ethereum (ERC-20)', nowpaymentsCode: 'shib' },
  { symbol: 'SHIB', network: 'BSC (BEP-20)', nowpaymentsCode: 'shibbsc' },
  
  // Baby Doge
  { symbol: 'BABYDOGE', network: 'BSC (BEP-20)', nowpaymentsCode: 'babydoge' },
  
  // PancakeSwap
  { symbol: 'CAKE', network: 'BSC (BEP-20)', nowpaymentsCode: 'cake' },
  
  // Floki
  { symbol: 'FLOKI', network: 'Ethereum (ERC-20)', nowpaymentsCode: 'floki' },
  { symbol: 'FLOKI', network: 'BSC (BEP-20)', nowpaymentsCode: 'flokibsc' },
  
  // DOGS
  { symbol: 'DOGS', network: 'TON Network', nowpaymentsCode: 'dogs' },
  
  // Notcoin
  { symbol: 'NOTCOIN', network: 'TON Network', nowpaymentsCode: 'not' },
  
  // Dogecoin
  { symbol: 'DOGE', network: 'Dogecoin', nowpaymentsCode: 'doge' },
  
  // USDT (multiple networks)
  { symbol: 'USDT', network: 'TRC-20 (Tron)', nowpaymentsCode: 'usdttrc20' },
  { symbol: 'USDT', network: 'BSC (BEP-20)', nowpaymentsCode: 'usdtbsc' },
  { symbol: 'USDT', network: 'Ethereum (ERC-20)', nowpaymentsCode: 'usdterc20' },
  { symbol: 'USDT', network: 'Solana', nowpaymentsCode: 'usdtsol' },
  
  // USDC (multiple networks)
  { symbol: 'USDC', network: 'Ethereum (ERC-20)', nowpaymentsCode: 'usdc' },
  { symbol: 'USDC', network: 'BSC (BEP-20)', nowpaymentsCode: 'usdcbsc' },
  { symbol: 'USDC', network: 'Solana', nowpaymentsCode: 'usdcsol' },
  { symbol: 'USDC', network: 'Polygon', nowpaymentsCode: 'usdcmatic' },
];

// Helper function to get NOWPayments currency code
export function getNOWPaymentsCurrency(symbol: string, network: string): string | null {
  const mapping = NOWPAYMENTS_CURRENCY_MAP.find(
    (m) => m.symbol === symbol && m.network === network
  );
  return mapping?.nowpaymentsCode || null;
}

// Helper function to check if tag/memo is required
export function requiresTag(symbol: string, network: string): boolean {
  const mapping = NOWPAYMENTS_CURRENCY_MAP.find(
    (m) => m.symbol === symbol && m.network === network
  );
  return mapping?.requiresTag || false;
}

// Get human-readable network name from NOWPayments code
export function getNetworkFromCode(code: string): string {
  const mapping = NOWPAYMENTS_CURRENCY_MAP.find(
    (m) => m.nowpaymentsCode === code
  );
  return mapping?.network || code;
}
