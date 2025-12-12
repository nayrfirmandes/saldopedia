import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import ReferralContent from './referral-content';
import { getReferralStats } from '@/lib/referral-stats';
import { ensureUserHasReferralCode } from '@/lib/referral';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReferralPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  const referralCode = await ensureUserHasReferralCode(user.id, user.name);

  const stats = await getReferralStats(user.id);
  
  if (!stats.referralCode) {
    stats.referralCode = referralCode;
  }

  return (
    <ReferralContent 
      user={user}
      stats={stats}
    />
  );
}
