import { InsertTransaction } from "@/shared/schema";
import { PAYPAL_SKRILL_RATES, SYMBOL_TO_ID } from "./rates";

const INDONESIAN_NAMES = [
  "Ahmad", "Budi", "Siti", "Dewi", "Eka", "Fajar", "Gita", "Hendra",
  "Indah", "Joko", "Kartika", "Lina", "Made", "Nur", "Oki", "Putri",
  "Rini", "Sandi", "Tari", "Umar", "Vina", "Wawan", "Yuni", "Zainal",
  "Adi", "Agus", "Ayu", "Bayu", "Citra", "Dian", "Eko", "Fitri",
  "Hadi", "Iwan", "Jaya", "Kiki", "Lukman", "Maya", "Nina", "Oka",
  "Prima", "Qori", "Rani", "Sari", "Tono", "Ulfa", "Vera", "Yoga",
  "Zaki", "Andi", "Bella", "Candra", "Deni", "Evi", "Feri", "Gina",
  "Hani", "Irfan", "Juni", "Kris", "Lisa", "Mira", "Nanda", "Oni"
];

const LAST_NAME_INITIALS = [
  "R***", "S***", "W***", "P***", "A***", "M***", "K***", "H***",
  "D***", "L***", "F***", "N***", "T***", "C***", "B***", "G***",
  "Y***", "Z***", "E***", "I***", "O***", "U***", "J***", "V***",
  "Q***", "X***", "R**i", "S**a", "W**o", "P**i", "A**u", "M**a"
];

const CRYPTOCURRENCIES = [
  { symbol: "BTC", name: "Bitcoin", minAmount: 0.0001, maxAmount: 0.05 },
  { symbol: "ETH", name: "Ethereum", minAmount: 0.001, maxAmount: 0.5 },
  { symbol: "USDT", name: "Tether", minAmount: 10, maxAmount: 1500 },
  { symbol: "USDC", name: "USD Coin", minAmount: 10, maxAmount: 1500 },
  { symbol: "BNB", name: "BNB", minAmount: 0.01, maxAmount: 3 },
  { symbol: "SOL", name: "Solana", minAmount: 0.1, maxAmount: 15 },
  { symbol: "XRP", name: "Ripple", minAmount: 10, maxAmount: 1500 },
  { symbol: "ADA", name: "Cardano", minAmount: 10, maxAmount: 3000 },
  { symbol: "DOGE", name: "Dogecoin", minAmount: 50, maxAmount: 8000 },
  { symbol: "TRX", name: "Tron", minAmount: 50, maxAmount: 6000 },
  { symbol: "MATIC", name: "Polygon", minAmount: 5, maxAmount: 1500 },
  { symbol: "TON", name: "Toncoin", minAmount: 1, maxAmount: 500 },
  { symbol: "SHIB", name: "Shiba Inu", minAmount: 100000, maxAmount: 10000000 },
  { symbol: "CAKE", name: "PancakeSwap", minAmount: 1, maxAmount: 500 },
  { symbol: "FLOKI", name: "Floki Inu", minAmount: 10000, maxAmount: 5000000 },
  { symbol: "TKO", name: "Tokocrypto", minAmount: 5, maxAmount: 1000 },
  { symbol: "BABYDOGE", name: "Baby Doge", minAmount: 1000000, maxAmount: 100000000 },
  { symbol: "DOGS", name: "Dogs", minAmount: 100, maxAmount: 50000 },
  { symbol: "NOTCOIN", name: "Notcoin", minAmount: 100, maxAmount: 50000 },
];

const PAYMENT_METHODS = [
  "BCA", "Mandiri", "BNI", "BRI",
  "DANA", "OVO", "GoPay"
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 8): number {
  const num = Math.random() * (max - min) + min;
  return Number(num.toFixed(decimals));
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function generateTransactionId(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.getTime().toString().slice(-6);
  const random = randomInt(100, 999);
  return `TRX-${dateStr}-${timeStr}${random}`;
}

function maskUserName(): string {
  const firstName = randomElement(INDONESIAN_NAMES);
  const lastInitial = randomElement(LAST_NAME_INITIALS);
  return `${firstName} ${lastInitial}`;
}

function getRateForAmount(amount: number, transactionType: "buy" | "sell"): number {
  const tiers = transactionType === "sell" ? PAYPAL_SKRILL_RATES.convert : PAYPAL_SKRILL_RATES.topup;
  
  for (const tier of tiers) {
    if (amount >= tier.min && amount <= tier.max) {
      return tier.rate;
    }
  }
  
  return tiers[tiers.length - 1].rate;
}

export async function generateDummyTransaction(
  priceSnapshot?: { [key: string]: { idr: number } }
): Promise<InsertTransaction> {
  const serviceType = randomElement(["cryptocurrency", "paypal", "skrill"] as const);
  const transactionType = randomElement(["buy", "sell"] as const);
  const paymentMethod = randomElement(PAYMENT_METHODS);
  const userName = maskUserName();

  let amountIdr: string;
  let amountForeign: string | null = null;
  let cryptoSymbol: string | null = null;
  let status: "completed" | "processing" | "pending";

  // Random age distribution for realistic feed
  const randomValue = Math.random();
  let ageMs: number;
  
  if (randomValue < 0.3) {
    // 30% super fresh → pending for animation (use NOW for real-time updates)
    ageMs = 0;
    status = "pending";
  } else if (randomValue < 0.5) {
    // 20% recent (30s-2min) → completed
    ageMs = randomInt(30000, 120000);
    status = "completed";
  } else if (randomValue < 0.7) {
    // 20% few minutes ago (2-10min) → completed
    ageMs = randomInt(120000, 600000);
    status = "completed";
  } else {
    // 30% older (10-30min) → completed
    ageMs = randomInt(600000, 1800000);
    status = "completed";
  }

  if (serviceType === "cryptocurrency") {
    const crypto = randomElement(CRYPTOCURRENCIES);
    cryptoSymbol = crypto.symbol;
    
    const coinId = SYMBOL_TO_ID[crypto.symbol];
    const marketPrice = priceSnapshot?.[coinId]?.idr || 0;
    
    if (!marketPrice) {
      throw new Error(`No price available for ${crypto.symbol}`);
    }
    
    const spread = transactionType === "sell" ? 0.95 : 1.05;
    const effectivePrice = marketPrice * spread;
    
    // Retry loop to ensure minimum 25,000 IDR for crypto transactions
    const MIN_CRYPTO_IDR = 25000;
    let attempts = 0;
    const MAX_ATTEMPTS = 50;
    
    do {
      amountForeign = randomFloat(crypto.minAmount, crypto.maxAmount, 8).toString();
      amountIdr = (parseFloat(amountForeign) * effectivePrice).toFixed(2);
      attempts++;
      
      // If can't reach minimum after many attempts, force minimum amount
      if (attempts >= MAX_ATTEMPTS) {
        const minTokensNeeded = MIN_CRYPTO_IDR / effectivePrice;
        amountForeign = Math.max(minTokensNeeded, crypto.minAmount).toFixed(8);
        amountIdr = (parseFloat(amountForeign) * effectivePrice).toFixed(2);
        break;
      }
    } while (parseFloat(amountIdr) < MIN_CRYPTO_IDR);
    
  } else if (serviceType === "paypal") {
    const amountOptions = [
      randomFloat(20, 50, 2),
      randomFloat(50, 100, 2), 
      randomFloat(100, 200, 2),
      randomFloat(200, 500, 2),
      randomFloat(500, 1000, 2),
      randomFloat(1000, 2500, 2),
    ];
    const usdAmount = randomElement(amountOptions);
    amountForeign = usdAmount.toString();
    const exchangeRate = getRateForAmount(usdAmount, transactionType);
    amountIdr = (usdAmount * exchangeRate).toFixed(2);
  } else {
    const amountOptions = [
      randomFloat(20, 50, 2),
      randomFloat(50, 100, 2),
      randomFloat(100, 200, 2),
      randomFloat(200, 400, 2),
      randomFloat(400, 800, 2),
    ];
    const usdAmount = randomElement(amountOptions);
    amountForeign = usdAmount.toString();
    const exchangeRate = getRateForAmount(usdAmount, transactionType);
    amountIdr = (usdAmount * exchangeRate).toFixed(2);
  }

  const now = new Date();
  const createdAt = new Date(now.getTime() - ageMs);
  const completedAt = status === "completed" 
    ? new Date(createdAt.getTime() + randomInt(300000, 900000)) // 5-15 min after creation
    : null; // Will be set when status becomes completed for pending/processing

  return {
    transactionId: generateTransactionId(),
    userName,
    serviceType,
    cryptoSymbol,
    transactionType,
    amountIdr,
    amountForeign,
    status,
    paymentMethod,
    createdAt,
    completedAt,
  };
}
