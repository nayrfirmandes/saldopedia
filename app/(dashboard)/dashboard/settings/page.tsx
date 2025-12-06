import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import SettingsForm from './settings-form';
import SettingsContent from './settings-content';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getDatabaseUrl } from '@/lib/db-url';

export const revalidate = 15;

export default async function SettingsPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  const sql = neon(getDatabaseUrl());
  const db = drizzle(sql);
  
  const [dbUser] = await db
    .select({ password: users.password, googleId: users.googleId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const hasPassword = !!dbUser?.password;
  const isGoogleUser = !!dbUser?.googleId;

  return (
    <>
      <SettingsContent />
      <SettingsForm user={user} hasPassword={hasPassword} isGoogleUser={isGoogleUser} />
    </>
  );
}
