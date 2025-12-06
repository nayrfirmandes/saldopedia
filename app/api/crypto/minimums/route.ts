import { NextRequest, NextResponse } from "next/server";
import { getMinimumAmount, getAllMinimumAmounts } from "@/lib/nowpayments-limits";
import { SUPPORTED_CRYPTOS, SYMBOL_TO_NOWPAYMENTS } from "@/lib/rates";

const USD_TO_IDR_RATE = 16000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const priceParam = searchParams.get("price");
    
    if (symbol && priceParam) {
      const price = parseFloat(priceParam);
      
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid price parameter" },
          { status: 400 }
        );
      }

      if (!SYMBOL_TO_NOWPAYMENTS[symbol]) {
        return NextResponse.json(
          { success: false, error: `Unsupported cryptocurrency: ${symbol}` },
          { status: 400 }
        );
      }

      const result = await getMinimumAmount(symbol, price, USD_TO_IDR_RATE);
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch minimum amount" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result
      });
    }

    const pricesParam = searchParams.get("prices");
    
    if (pricesParam) {
      try {
        const prices = JSON.parse(pricesParam);
        const results = await getAllMinimumAmounts(prices, USD_TO_IDR_RATE);
        
        return NextResponse.json({
          success: true,
          data: results
        });
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: "Invalid prices parameter" },
          { status: 400 }
        );
      }
    }

    const supportedCryptos = Object.entries(SUPPORTED_CRYPTOS).map(([id, config]) => ({
      id,
      symbol: config.symbol,
      name: config.name,
      nowpayments: config.nowpayments,
      supported: !!SYMBOL_TO_NOWPAYMENTS[config.symbol]
    }));

    return NextResponse.json({
      success: true,
      data: {
        cryptos: supportedCryptos,
        note: "Add ?symbol=BTC&price=95000 to get minimum for specific crypto"
      }
    });
  } catch (error) {
    console.error("Error fetching crypto minimums:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
