import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from "@/lib/db-url";

export interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  totalPointsEarned: number;
  referrals: Array<{
    id: number;
    referredName: string;
    pointsAwarded: number;
    createdAt: string;
  }>;
}

export async function getReferralStats(userId: number): Promise<ReferralStats> {
  const sql = neon(getDatabaseUrl());
  
  const [user] = await sql`SELECT referral_code, points FROM users WHERE id = ${userId}`;
  
  const referralsData = await sql`
    SELECT 
      r.id,
      u.name as referred_name,
      r.referrer_points_awarded as points_awarded,
      r.created_at
    FROM referrals r
    JOIN users u ON u.id = r.referred_id
    WHERE r.referrer_id = ${userId}
    ORDER BY r.created_at DESC
    LIMIT 50
  `;

  const [totalStats] = await sql`
    SELECT 
      COUNT(*) as total_referrals,
      COALESCE(SUM(referrer_points_awarded), 0) as total_points_earned
    FROM referrals
    WHERE referrer_id = ${userId}
  `;

  return {
    referralCode: user?.referral_code || null,
    totalReferrals: parseInt(totalStats?.total_referrals || '0'),
    totalPointsEarned: parseInt(totalStats?.total_points_earned || '0'),
    referrals: referralsData.map((r: any) => ({
      id: r.id,
      referredName: r.referred_name,
      pointsAwarded: r.points_awarded,
      createdAt: new Date(r.created_at).toISOString(),
    })),
  };
}
