import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  
  if (!token) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/login?error=missing_token' }
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://saldopedia.com';
  
  // Calculate expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const expiresString = expiresAt.toUTCString();
  
  // Set cookie using Set-Cookie header and redirect using meta refresh
  // Cookie name MUST be 'saldopedia_session' to match the auth system
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${appUrl}/dashboard">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to dashboard...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': `saldopedia_session=${token}; Path=/; Expires=${expiresString}; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}
