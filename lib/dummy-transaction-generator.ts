import { InsertTransaction } from "@/shared/schema";
import { PAYPAL_SKRILL_RATES, LIMITS, CryptoConfig, RateTier } from "./rates";
import { DEFAULT_NETWORK_FEES } from "./network-fees";

const INDONESIAN_NAMES = [
  "Ahmad", "Budi", "Siti", "Dewi", "Eka", "Fajar", "Gita", "Hendra",
  "Indah", "Joko", "Kartika", "Lina", "Made", "Nur", "Oki", "Putri",
  "Rini", "Sandi", "Tari", "Umar", "Vina", "Wawan", "Yuni", "Zainal",
  "Adi", "Agus", "Ayu", "Bayu", "Citra", "Dian", "Eko", "Fitri",
  "Hadi", "Iwan", "Jaya", "Kiki", "Lukman", "Maya", "Nina", "Oka",
  "Prima", "Rani", "Sari", "Tono", "Ulfa", "Vera", "Yoga", "Zaki",
  "Andi", "Bella", "Candra", "Deni", "Evi", "Feri", "Gina", "Hani",
  "Irfan", "Juni", "Kris", "Lisa", "Mira", "Nanda", "Oni", "Ratna",
  "Surya", "Tika", "Umi", "Wahyu", "Yusuf", "Arif", "Bagus", "Cahya",
  "Dimas", "Elsa", "Faisal", "Galih", "Hana", "Ilham", "Jasmine", "Kevin"
];

const LAST_NAME_INITIALS = [
  "R***", "S***", "W***", "P***", "A***", "M***", "K***", "H***",
  "D***", "L***", "F***", "N***", "T***", "C***", "B***", "G***",
  "Y***", "Z***", "E***", "I***", "O***", "U***", "J***", "V***",
  "R**i", "S**a", "W**o", "P**i", "A**u", "M**a", "K**n", "H**i",
  "D**a", "L**o", "N**i", "T**o", "B**u", "G**a", "Y**a", "Z**i"
];

const CRYPTOCURRENCIES = [
  { symbol: "BTC", networks: ["Bitcoin"], minAmount: 0.0001, maxAmount: 0.015, weight: 18 },
  { symbol: "ETH", networks: ["Ethereum (ERC-20)"], minAmount: 0.005, maxAmount: 0.25, weight: 16 },
  { symbol: "USDT", networks: ["TRC-20 (Tron)", "BSC (BEP-20)", "Solana"], minAmount: 10, maxAmount: 800, weight: 25 },
  { symbol: "USDC", networks: ["Solana", "BSC (BEP-20)"], minAmount: 10, maxAmount: 500, weight: 6 },
  { symbol: "BNB", networks: ["BSC (BEP-20)"], minAmount: 0.02, maxAmount: 1.5, weight: 10 },
  { symbol: "SOL", networks: ["Solana"], minAmount: 0.2, maxAmount: 8, weight: 12 },
  { symbol: "XRP", networks: ["XRP Ledger"], minAmount: 20, maxAmount: 800, weight: 6 },
  { symbol: "TRX", networks: ["Tron (TRC-20)"], minAmount: 100, maxAmount: 5000, weight: 5 },
  { symbol: "DOGE", networks: ["Dogecoin"], minAmount: 50, maxAmount: 3000, weight: 4 },
  { symbol: "TON", networks: ["TON Network"], minAmount: 3, maxAmount: 150, weight: 5 },
  { symbol: "MATIC", networks: ["Polygon"], minAmount: 10, maxAmount: 800, weight: 3 },
  { symbol: "ADA", networks: ["Cardano"], minAmount: 30, maxAmount: 1500, weight: 2 },
  { symbol: "SHIB", networks: ["BSC (BEP-20)"], minAmount: 500000, maxAmount: 50000000, weight: 3 },
  { symbol: "DOGS", networks: ["TON Network"], minAmount: 500, maxAmount: 50000, weight: 2 },
];

const SYMBOL_TO_ID: { [key: string]: string } = {
  BTC: "bitcoin", ETH: "ethereum", USDT: "tether", USDC: "usd-coin",
  BNB: "binancecoin", SOL: "solana", XRP: "ripple", TRX: "tron",
  DOGE: "dogecoin", TON: "the-open-network", MATIC: "polygon-ecosystem-token", 
  ADA: "cardano", SHIB: "shiba-inu", DOGS: "dogs-2"
};

const PAYMENT_METHODS_SELL = [
  "BCA", "BCA", "BCA", "Mandiri", "Mandiri", "BNI", "BRI", "BRI",
  "DANA", "DANA", "OVO", "GoPay", "ShopeePay", "LinkAja", "Jago", "SeaBank"
];

export interface DynamicRatesConfig {
  cryptoConfig: CryptoConfig;
  paypalRates: { convert: RateTier[]; topup: RateTier[] };
  skrillRates: { convert: RateTier[]; topup: RateTier[] };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function weightedRandomCrypto() {
  const totalWeight = CRYPTOCURRENCIES.reduce((sum, c) => sum + c.weight, 0);
  let random = Math.random() * totalWeight;
  for (const crypto of CRYPTOCURRENCIES) {
    random -= crypto.weight;
    if (random <= 0) return crypto;
  }
  return CRYPTOCURRENCIES[0];
}

function generateTransactionId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TRX-";
  for (let i = 0; i < 8; i++) {
    id += chars[randomInt(0, chars.length - 1)];
  }
  return id;
}

function maskUserName(): string {
  return `${randomElement(INDONESIAN_NAMES)} ${randomElement(LAST_NAME_INITIALS)}`;
}

function getRateForAmount(amount: number, tiers: RateTier[]): number {
  for (const tier of tiers) {
    if (amount >= tier.min && amount <= tier.max) return tier.rate;
  }
  return tiers[tiers.length - 1].rate;
}

function getRandomAmount(min: number, max: number): number {
  const range = max - min;
  const rand = Math.random();
  if (rand < 0.5) {
    return min + range * rand * 0.4;
  } else if (rand < 0.85) {
    return min + range * (0.2 + rand * 0.4);
  } else {
    return min + range * (0.5 + rand * 0.5);
  }
}

export async function generateDummyTransaction(
  priceSnapshot?: { [key: string]: { idr: number } },
  dynamicRates?: DynamicRatesConfig
): Promise<InsertTransaction & { cryptoNetwork?: string }> {
  const rand = Math.random();
  const serviceType = rand < 0.7 ? "cryptocurrency" : (rand < 0.85 ? "paypal" : "skrill");
  
  const buyWeight = serviceType === "cryptocurrency" ? 0.6 : 0.5;
  const transactionType = Math.random() < buyWeight ? "buy" : "sell";
  
  const userName = maskUserName();
  const paymentMethod = transactionType === "buy" ? "Saldo" : randomElement(PAYMENT_METHODS_SELL);

  let amountIdr: string;
  let amountForeign: string | null = null;
  let cryptoSymbol: string | null = null;
  let cryptoNetwork: string | undefined;
  
  const statusRand = Math.random();
  const status: "completed" | "pending" | "processing" = 
    statusRand < 0.7 ? "completed" : (statusRand < 0.9 ? "pending" : "processing");

  const cryptoConfig = dynamicRates?.cryptoConfig;
  const paypalRates = dynamicRates?.paypalRates || PAYPAL_SKRILL_RATES;
  const skrillRates = dynamicRates?.skrillRates || PAYPAL_SKRILL_RATES;

  if (serviceType === "cryptocurrency") {
    const crypto = weightedRandomCrypto();
    cryptoSymbol = crypto.symbol;
    cryptoNetwork = randomElement(crypto.networks);
    
    const coinId = SYMBOL_TO_ID[crypto.symbol];
    const marketPrice = priceSnapshot?.[coinId]?.idr || 0;
    if (!marketPrice) throw new Error(`No price for ${crypto.symbol}`);
    
    const isStablecoin = crypto.symbol === "USDT" || crypto.symbol === "USDC";
    let effectivePrice: number;
    
    if (isStablecoin) {
      const stablecoinRates = cryptoConfig?.stablecoins?.[crypto.symbol];
      effectivePrice = transactionType === "sell" 
        ? (stablecoinRates?.convert || 14000)
        : (stablecoinRates?.topup || 16999);
    } else {
      const marginSell = cryptoConfig?.margin_convert || 0.95;
      const marginBuy = cryptoConfig?.margin_topup || 1.05;
      const margin = transactionType === "sell" ? marginSell : marginBuy;
      effectivePrice = marketPrice * margin;
    }
    
    const networkFee = transactionType === "buy" 
      ? (DEFAULT_NETWORK_FEES[crypto.symbol]?.[cryptoNetwork] || 5000) 
      : 0;
    
    const minIdr = transactionType === "buy" ? LIMITS.crypto.min_idr_buy : LIMITS.crypto.min_idr_sell;
    let attempts = 0;
    
    do {
      const rawAmount = getRandomAmount(crypto.minAmount, crypto.maxAmount);
      amountForeign = rawAmount.toFixed(8);
      const baseIdr = parseFloat(amountForeign) * effectivePrice;
      amountIdr = Math.round(baseIdr + networkFee).toString();
      attempts++;
      if (attempts > 20) {
        const minTokens = (minIdr - networkFee) / effectivePrice;
        amountForeign = Math.max(minTokens, crypto.minAmount).toFixed(8);
        amountIdr = Math.round(parseFloat(amountForeign) * effectivePrice + networkFee).toString();
        break;
      }
    } while (parseFloat(amountIdr) < minIdr);
    
  } else {
    const rates = serviceType === "paypal" ? paypalRates : skrillRates;
    const tiers = transactionType === "sell" ? rates.convert : rates.topup;
    
    const minUsd = LIMITS.paypal.min_usd;
    const maxUsd = Math.min(LIMITS.paypal.max_usd, 1500);
    const usdAmount = Math.round(getRandomAmount(minUsd, maxUsd));
    amountForeign = usdAmount.toString();
    const rate = getRateForAmount(usdAmount, tiers);
    amountIdr = Math.round(usdAmount * rate).toString();
  }

  const ageRand = Math.random();
  let ageMs: number;
  if (status === "pending") {
    ageMs = randomInt(0, 30000);
  } else if (status === "processing") {
    ageMs = randomInt(30000, 120000);
  } else {
    if (ageRand < 0.3) ageMs = randomInt(60000, 300000);
    else if (ageRand < 0.6) ageMs = randomInt(300000, 900000);
    else if (ageRand < 0.85) ageMs = randomInt(900000, 1800000);
    else ageMs = randomInt(1800000, 3600000);
  }
  
  const createdAt = new Date(Date.now() - ageMs);
  const completedAt = status === "completed" 
    ? new Date(createdAt.getTime() + randomInt(30000, 600000)) 
    : null;

  return {
    transactionId: generateTransactionId(),
    userName,
    serviceType,
    cryptoSymbol,
    cryptoNetwork,
    transactionType,
    amountIdr,
    amountForeign,
    status,
    paymentMethod,
    createdAt,
    completedAt,
  };
}
