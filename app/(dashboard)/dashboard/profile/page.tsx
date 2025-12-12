import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import ProfileContent from './profile-content';

export const revalidate = 15;

export default async function ProfilePage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  return <ProfileContent user={user} />;
}
