import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";
import { CRYPTO_CONFIG, PAYPAL_SKRILL_RATES } from "@/lib/rates";

interface RateSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  description: string | null;
  updatedAt: Date;
  updatedBy: number | null;
}

const DEFAULT_SETTINGS = {
  crypto_margin_sell: { value: String(CRYPTO_CONFIG.margin_convert), description: "Crypto sell margin (multiply market price)" },
  crypto_margin_buy: { value: String(CRYPTO_CONFIG.margin_topup), description: "Crypto buy margin (multiply market price)" },
  stablecoin_usdt_sell: { value: String(CRYPTO_CONFIG.stablecoins.USDT.convert), description: "USDT sell rate (IDR)" },
  stablecoin_usdt_buy: { value: String(CRYPTO_CONFIG.stablecoins.USDT.topup), description: "USDT buy rate (IDR)" },
  stablecoin_usdc_sell: { value: String(CRYPTO_CONFIG.stablecoins.USDC.convert), description: "USDC sell rate (IDR)" },
  stablecoin_usdc_buy: { value: String(CRYPTO_CONFIG.stablecoins.USDC.topup), description: "USDC buy rate (IDR)" },
  paypal_sell_tiers: { value: JSON.stringify(PAYPAL_SKRILL_RATES.convert), description: "PayPal sell rate tiers" },
  paypal_buy_tiers: { value: JSON.stringify(PAYPAL_SKRILL_RATES.topup), description: "PayPal buy rate tiers" },
  skrill_sell_tiers: { value: JSON.stringify(PAYPAL_SKRILL_RATES.convert), description: "Skrill sell rate tiers" },
  skrill_buy_tiers: { value: JSON.stringify(PAYPAL_SKRILL_RATES.topup), description: "Skrill buy rate tiers" },
};

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - not admin" },
        { status: 401 }
      );
    }

    const sql = neon(getDatabaseUrl());

    const settings = await sql`
      SELECT 
        id,
        setting_key,
        setting_value,
        description,
        updated_at,
        updated_by
      FROM rate_settings
      ORDER BY setting_key
    `;

    const settingsMap: Record<string, RateSetting> = {};
    settings.forEach((s: any) => {
      settingsMap[s.setting_key] = {
        id: s.id,
        settingKey: s.setting_key,
        settingValue: s.setting_value,
        description: s.description,
        updatedAt: s.updated_at,
        updatedBy: s.updated_by,
      };
    });

    const result: Record<string, any> = {};
    for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
      if (settingsMap[key]) {
        result[key] = {
          value: settingsMap[key].settingValue,
          description: settingsMap[key].description || def.description,
          updatedAt: settingsMap[key].updatedAt,
          isDefault: false,
        };
      } else {
        result[key] = {
          value: def.value,
          description: def.description,
          updatedAt: null,
          isDefault: true,
        };
      }
    }

    return NextResponse.json({
      settings: result,
      defaults: DEFAULT_SETTINGS,
    });

  } catch (error) {
    console.error("Admin rates GET error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - not admin" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settingKey, settingValue } = body;

    if (!settingKey || settingValue === undefined) {
      return NextResponse.json(
        { error: "settingKey and settingValue are required" },
        { status: 400 }
      );
    }

    if (!Object.keys(DEFAULT_SETTINGS).includes(settingKey)) {
      return NextResponse.json(
        { error: "Invalid setting key" },
        { status: 400 }
      );
    }

    if (settingKey.includes('margin')) {
      const margin = parseFloat(settingValue);
      if (isNaN(margin) || margin < 0.5 || margin > 2) {
        return NextResponse.json(
          { error: "Margin must be between 0.5 and 2" },
          { status: 400 }
        );
      }
    }

    if (settingKey.includes('stablecoin') || (settingKey.includes('_sell_') && !settingKey.includes('tiers')) || (settingKey.includes('_buy_') && !settingKey.includes('tiers'))) {
      const rate = parseFloat(settingValue);
      if (isNaN(rate) || rate < 1000 || rate > 100000) {
        return NextResponse.json(
          { error: "Rate must be between 1,000 and 100,000 IDR" },
          { status: 400 }
        );
      }
    }

    if (settingKey.includes('tiers')) {
      try {
        const tiers = JSON.parse(settingValue);
        if (!Array.isArray(tiers) || tiers.length === 0) {
          throw new Error("Tiers must be a non-empty array");
        }
        for (const tier of tiers) {
          if (typeof tier.min !== 'number' || typeof tier.max !== 'number' || typeof tier.rate !== 'number') {
            throw new Error("Each tier must have min, max, and rate as numbers");
          }
          if (tier.min < 0 || tier.max < tier.min || tier.rate < 1000) {
            throw new Error("Invalid tier values");
          }
        }
      } catch (e: any) {
        return NextResponse.json(
          { error: `Invalid tier format: ${e.message}` },
          { status: 400 }
        );
      }
    }

    const sql = neon(getDatabaseUrl());
    const description = DEFAULT_SETTINGS[settingKey as keyof typeof DEFAULT_SETTINGS]?.description || '';

    const existing = await sql`
      SELECT id FROM rate_settings WHERE setting_key = ${settingKey}
    `;

    if (existing.length > 0) {
      await sql`
        UPDATE rate_settings 
        SET 
          setting_value = ${String(settingValue)},
          updated_at = NOW(),
          updated_by = ${user.id}
        WHERE setting_key = ${settingKey}
      `;
    } else {
      await sql`
        INSERT INTO rate_settings (setting_key, setting_value, description, updated_by)
        VALUES (${settingKey}, ${String(settingValue)}, ${description}, ${user.id})
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Rate setting updated successfully",
      settingKey,
      settingValue: String(settingValue),
    });

  } catch (error) {
    console.error("Admin rates PUT error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
