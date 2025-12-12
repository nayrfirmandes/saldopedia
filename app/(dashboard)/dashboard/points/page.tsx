import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import PointsContent from './points-content';
import { getPointsHistory } from '@/lib/points';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getDatabaseUrl } from '@/lib/db-url';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PointsPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  const sql = neon(getDatabaseUrl());
  const db = drizzle(sql);

  const [dbUser] = await db
    .select({ 
      emailVerified: users.emailVerified,
      phoneVerified: users.phoneVerified,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const history = await getPointsHistory(user.id);

  return (
    <PointsContent 
      user={user}
      history={history}
      emailVerified={dbUser?.emailVerified ?? false}
      phoneVerified={dbUser?.phoneVerified ?? false}
    />
  );
}
