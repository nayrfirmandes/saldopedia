import { NextResponse } from "next/server";
import { getDynamicRates } from "@/lib/dynamic-rates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rates = await getDynamicRates();
    
    return NextResponse.json({
      success: true,
      cryptoConfig: rates.cryptoConfig,
      paypalRates: rates.paypalRates,
      skrillRates: rates.skrillRates,
      cachedAt: rates.fetchedAt,
    });
  } catch (error) {
    console.error("Error fetching dynamic rates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rates" },
      { status: 500 }
    );
  }
}
