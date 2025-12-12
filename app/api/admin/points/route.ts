import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";

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

    const [transactions, statsResult, topUsersResult] = await Promise.all([
      sql`
        SELECT 
          pt.id,
          pt.user_id,
          u.name as user_name,
          u.email as user_email,
          pt.type,
          pt.amount,
          pt.description,
          pt.referral_id,
          pt.created_at
        FROM point_transactions pt
        JOIN users u ON pt.user_id = u.id
        ORDER BY pt.created_at DESC
        LIMIT 500
      `,
      sql`
        SELECT 
          COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_earned,
          COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_redeemed,
          COUNT(CASE WHEN type = 'referral_bonus' THEN 1 END) as referral_bonus_count,
          COUNT(CASE WHEN type = 'referred_bonus' THEN 1 END) as referred_bonus_count,
          COUNT(CASE WHEN type = 'redeem' THEN 1 END) as redeem_count,
          COUNT(CASE WHEN type = 'adjustment' THEN 1 END) as adjustment_count
        FROM point_transactions
      `,
      sql`
        SELECT 
          id, name, email, points
        FROM users
        WHERE points > 0
        ORDER BY points DESC
        LIMIT 10
      `
    ]);

    const [totalCirculating] = await sql`
      SELECT COALESCE(SUM(points), 0) as total FROM users
    `;

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        userId: t.user_id,
        userName: t.user_name,
        userEmail: t.user_email,
        type: t.type,
        amount: t.amount,
        description: t.description,
        referralId: t.referral_id,
        createdAt: t.created_at,
      })),
      stats: {
        totalCirculating: Number(totalCirculating?.total || 0),
        totalEarned: Number(statsResult[0]?.total_earned || 0),
        totalRedeemed: Number(statsResult[0]?.total_redeemed || 0),
        referralBonusCount: Number(statsResult[0]?.referral_bonus_count || 0),
        referredBonusCount: Number(statsResult[0]?.referred_bonus_count || 0),
        redeemCount: Number(statsResult[0]?.redeem_count || 0),
        adjustmentCount: Number(statsResult[0]?.adjustment_count || 0),
      },
      topUsers: topUsersResult.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        points: u.points,
      })),
    });

  } catch (error) {
    console.error("Admin points error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
