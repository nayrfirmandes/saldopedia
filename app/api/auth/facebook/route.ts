import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID;
  
  if (!appId) {
    return NextResponse.json({ error: 'Facebook OAuth not configured' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
  const redirectUri = `${appUrl}/api/auth/facebook/callback`;
  
  const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  facebookAuthUrl.searchParams.set('client_id', appId);
  facebookAuthUrl.searchParams.set('redirect_uri', redirectUri);
  facebookAuthUrl.searchParams.set('scope', 'email,public_profile');
  facebookAuthUrl.searchParams.set('response_type', 'code');

  return NextResponse.redirect(facebookAuthUrl.toString());
}
