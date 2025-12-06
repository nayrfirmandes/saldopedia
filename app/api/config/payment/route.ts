import { NextResponse } from "next/server";
import { getAdminPaymentConfig } from "@/lib/payment-config";

export async function GET() {
  const config = getAdminPaymentConfig();
  return NextResponse.json(config);
}
