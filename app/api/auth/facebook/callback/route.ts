import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { users, sessions } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from '@/lib/db-url';
import { generateUniqueUserId } from '@/lib/user-id';

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUserInfo {
  id: string;
  email?: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;

  const errorRedirect = (errorCode: string) => {
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${appUrl}/login?error=${errorCode}` },
    });
  };

  if (error) {
    return errorRedirect('facebook_auth_cancelled');
  }

  if (!code) {
    return errorRedirect('facebook_auth_failed');
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    return errorRedirect('facebook_not_configured');
  }

  const redirectUri = `${appUrl}/api/auth/facebook/callback`;

  try {
    console.log('[Facebook OAuth] Starting token exchange');
    
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Facebook OAuth] Token error:', errorText);
      return errorRedirect('facebook_token_failed');
    }

    const tokenData: FacebookTokenResponse = await tokenResponse.json();

    const userInfoUrl = new URL('https://graph.facebook.com/v18.0/me');
    userInfoUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
    userInfoUrl.searchParams.set('access_token', tokenData.access_token);

    const userInfoResponse = await fetch(userInfoUrl.toString());

    if (!userInfoResponse.ok) {
      console.error('[Facebook OAuth] Userinfo error:', await userInfoResponse.text());
      return errorRedirect('facebook_userinfo_failed');
    }

    const facebookUser: FacebookUserInfo = await userInfoResponse.json();
    console.log('[Facebook OAuth] Got user info for:', facebookUser.email || facebookUser.name);

    if (!facebookUser.email) {
      console.error('[Facebook OAuth] No email provided by Facebook');
      return errorRedirect('facebook_no_email');
    }

    let user = await db.select().from(users).where(eq(users.facebookId, facebookUser.id)).limit(1);

    if (user.length === 0) {
      user = await db.select().from(users).where(eq(users.email, facebookUser.email)).limit(1);

      if (user.length > 0) {
        await db.update(users)
          .set({ 
            facebookId: facebookUser.id,
            emailVerified: true,
            photoUrl: user[0].photoUrl || facebookUser.picture?.data?.url,
            updatedAt: new Date()
          })
          .where(eq(users.id, user[0].id));
      } else {
        const sql = neon(getDatabaseUrl());
        const uniqueUserId = await generateUniqueUserId();
        const photoUrl = facebookUser.picture?.data?.url || null;
        const newUser = await sql`
          INSERT INTO users (id, email, name, facebook_id, photo_url, email_verified, created_at, updated_at)
          VALUES (${uniqueUserId}, ${facebookUser.email}, ${facebookUser.name}, ${facebookUser.id}, ${photoUrl}, true, NOW(), NOW())
          RETURNING id, email, name
        `;
        user = newUser as any;
      }
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      userId: user[0].id,
      token: sessionToken,
      expiresAt,
    });

    console.log('[Facebook OAuth] Session created, redirecting to set-session endpoint');

    const setSessionUrl = `${appUrl}/api/auth/set-session?token=${sessionToken}`;
    return Response.redirect(setSessionUrl, 302);

  } catch (error) {
    console.error('[Facebook OAuth] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Facebook OAuth] Error message:', errorMessage);
    return errorRedirect('facebook_auth_error');
  }
}
