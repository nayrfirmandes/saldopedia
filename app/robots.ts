import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://saldopedia.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',                    // Block API routes
          '/_next/',                  // Block Next.js internals
          '/admin/',                  // Block admin area
          '/dashboard',               // Block user dashboard
          '/dashboard/*',             // Block all dashboard subpages
          '/order',                   // Block order page
          '/order/',                  // Block order pages (instructions, payment)
          '/verify-email',            // Block email verification page
          '/reset-password',          // Block password reset pages
          '/login',                   // Block login page
          '/register',                // Block register page
          '/forgot-password',         // Block forgot password page
        ],
      },
      // Special rules for search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
