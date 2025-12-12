import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { users, sessions } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from '@/lib/db-url';
import { generateUniqueUserId } from '@/lib/user-id';

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;

  // Helper to return error redirect
  const errorRedirect = (errorCode: string) => {
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${appUrl}/login?error=${errorCode}` },
    });
  };

  if (error) {
    return errorRedirect('google_auth_cancelled');
  }

  if (!code) {
    return errorRedirect('google_auth_failed');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return errorRedirect('google_not_configured');
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    console.log('[Google OAuth] Starting token exchange');
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Google OAuth] Token error:', errorText);
      return errorRedirect('google_token_failed');
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('[Google OAuth] Userinfo error:', await userInfoResponse.text());
      return errorRedirect('google_userinfo_failed');
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();
    console.log('[Google OAuth] Got user info for:', googleUser.email);

    let user = await db.select().from(users).where(eq(users.googleId, googleUser.id)).limit(1);

    if (user.length === 0) {
      user = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);

      if (user.length > 0) {
        await db.update(users)
          .set({ 
            googleId: googleUser.id,
            emailVerified: true,
            photoUrl: user[0].photoUrl || googleUser.picture,
            updatedAt: new Date()
          })
          .where(eq(users.id, user[0].id));
      } else {
        const sql = neon(getDatabaseUrl());
        const userId = await generateUniqueUserId();
        const newUser = await sql`
          INSERT INTO users (id, email, name, google_id, photo_url, email_verified, created_at, updated_at)
          VALUES (${userId}, ${googleUser.email}, ${googleUser.name}, ${googleUser.id}, ${googleUser.picture || null}, true, NOW(), NOW())
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

    console.log('[Google OAuth] Session created, redirecting to set-session endpoint');

    // Redirect to set-session endpoint which sets cookie server-side
    const setSessionUrl = `${appUrl}/api/auth/set-session?token=${sessionToken}`;
    return Response.redirect(setSessionUrl, 302);

  } catch (error) {
    console.error('[Google OAuth] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Google OAuth] Error message:', errorMessage);
    return errorRedirect('google_auth_error');
  }
}
