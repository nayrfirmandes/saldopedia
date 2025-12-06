import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { transactions } from "@/shared/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const recentTransactions = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(20);

    return NextResponse.json(recentTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
