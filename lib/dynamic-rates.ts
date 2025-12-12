import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./db-url";
import { 
  CRYPTO_CONFIG, 
  PAYPAL_SKRILL_RATES, 
  RateTier, 
  CryptoConfig 
} from "./rates";

interface RateSettingRow {
  setting_key: string;
  setting_value: string;
}

interface CachedRates {
  cryptoConfig: CryptoConfig;
  paypalRates: { convert: RateTier[]; topup: RateTier[] };
  skrillRates: { convert: RateTier[]; topup: RateTier[] };
  fetchedAt: number;
}

let cachedRates: CachedRates | null = null;
const CACHE_TTL_MS = 60000;

async function fetchRateSettings(): Promise<RateSettingRow[]> {
  try {
    const sql = neon(getDatabaseUrl());
    const settings = await sql`SELECT setting_key, setting_value FROM rate_settings`;
    return settings as RateSettingRow[];
  } catch (error) {
    console.error("Error fetching rate settings:", error);
    return [];
  }
}

function parseSettings(settings: RateSettingRow[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.setting_key] = s.setting_value;
  }
  return map;
}

function buildCryptoConfig(settingsMap: Record<string, string>): CryptoConfig {
  return {
    margin_convert: settingsMap['crypto_margin_sell'] 
      ? parseFloat(settingsMap['crypto_margin_sell']) 
      : CRYPTO_CONFIG.margin_convert,
    margin_topup: settingsMap['crypto_margin_buy'] 
      ? parseFloat(settingsMap['crypto_margin_buy']) 
      : CRYPTO_CONFIG.margin_topup,
    stablecoins: {
      USDT: {
        convert: settingsMap['stablecoin_usdt_sell'] 
          ? parseFloat(settingsMap['stablecoin_usdt_sell']) 
          : CRYPTO_CONFIG.stablecoins.USDT.convert,
        topup: settingsMap['stablecoin_usdt_buy'] 
          ? parseFloat(settingsMap['stablecoin_usdt_buy']) 
          : CRYPTO_CONFIG.stablecoins.USDT.topup,
      },
      USDC: {
        convert: settingsMap['stablecoin_usdc_sell'] 
          ? parseFloat(settingsMap['stablecoin_usdc_sell']) 
          : CRYPTO_CONFIG.stablecoins.USDC.convert,
        topup: settingsMap['stablecoin_usdc_buy'] 
          ? parseFloat(settingsMap['stablecoin_usdc_buy']) 
          : CRYPTO_CONFIG.stablecoins.USDC.topup,
      },
    },
  };
}

function parseTiers(json: string | undefined, defaultTiers: RateTier[]): RateTier[] {
  if (!json) return defaultTiers;
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error("Error parsing rate tiers:", e);
  }
  return defaultTiers;
}

function buildPaypalRates(settingsMap: Record<string, string>): { convert: RateTier[]; topup: RateTier[] } {
  return {
    convert: parseTiers(settingsMap['paypal_sell_tiers'], PAYPAL_SKRILL_RATES.convert),
    topup: parseTiers(settingsMap['paypal_buy_tiers'], PAYPAL_SKRILL_RATES.topup),
  };
}

function buildSkrillRates(settingsMap: Record<string, string>): { convert: RateTier[]; topup: RateTier[] } {
  return {
    convert: parseTiers(settingsMap['skrill_sell_tiers'], PAYPAL_SKRILL_RATES.convert),
    topup: parseTiers(settingsMap['skrill_buy_tiers'], PAYPAL_SKRILL_RATES.topup),
  };
}

export async function getDynamicRates(): Promise<CachedRates> {
  const now = Date.now();
  
  if (cachedRates && (now - cachedRates.fetchedAt) < CACHE_TTL_MS) {
    return cachedRates;
  }

  const settings = await fetchRateSettings();
  const settingsMap = parseSettings(settings);

  cachedRates = {
    cryptoConfig: buildCryptoConfig(settingsMap),
    paypalRates: buildPaypalRates(settingsMap),
    skrillRates: buildSkrillRates(settingsMap),
    fetchedAt: now,
  };

  return cachedRates;
}

export async function getCryptoConfig(): Promise<CryptoConfig> {
  const rates = await getDynamicRates();
  return rates.cryptoConfig;
}

export async function getPaypalRates(): Promise<{ convert: RateTier[]; topup: RateTier[] }> {
  const rates = await getDynamicRates();
  return rates.paypalRates;
}

export async function getSkrillRates(): Promise<{ convert: RateTier[]; topup: RateTier[] }> {
  const rates = await getDynamicRates();
  return rates.skrillRates;
}

export function clearRateCache(): void {
  cachedRates = null;
}
