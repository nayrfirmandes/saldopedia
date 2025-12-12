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
    .select({ 
      password: users.password, 
      googleId: users.googleId, 
      nameChanged: users.nameChanged,
      emailVerified: users.emailVerified,
      phoneVerified: users.phoneVerified,
      pendingPhone: users.pendingPhone,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const hasPassword = !!dbUser?.password;
  const isGoogleUser = !!dbUser?.googleId;
  const nameChanged = dbUser?.nameChanged ?? false;
  const emailVerified = dbUser?.emailVerified ?? false;
  const phoneVerified = dbUser?.phoneVerified ?? false;
  const pendingPhone = dbUser?.pendingPhone ?? null;

  return (
    <>
      <SettingsContent />
      <SettingsForm 
        user={user} 
        hasPassword={hasPassword} 
        isGoogleUser={isGoogleUser} 
        nameChanged={nameChanged}
        emailVerified={emailVerified}
        phoneVerified={phoneVerified}
        pendingPhone={pendingPhone}
      />
    </>
  );
}
