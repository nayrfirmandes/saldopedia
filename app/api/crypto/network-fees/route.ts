import { NextRequest, NextResponse } from "next/server";
import { getNetworkFees, getNetworkFee, DEFAULT_NETWORK_FEES } from "@/lib/network-fees";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const network = searchParams.get("network");
    
    // Get all fees (from database or defaults)
    const fees = await getNetworkFees();
    
    // If specific symbol and network requested
    if (symbol && network) {
      const fee = getNetworkFee(symbol, network, fees);
      
      return NextResponse.json({
        success: true,
        data: {
          symbol,
          network,
          feeIDR: fee,
        }
      });
    }
    
    // If only symbol requested, return all networks for that symbol
    if (symbol) {
      const symbolFees = fees[symbol] || DEFAULT_NETWORK_FEES[symbol] || {};
      
      return NextResponse.json({
        success: true,
        data: {
          symbol,
          networks: symbolFees,
        }
      });
    }
    
    // Return all fees
    return NextResponse.json({
      success: true,
      data: fees
    });
  } catch (error) {
    console.error("Error fetching network fees:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
