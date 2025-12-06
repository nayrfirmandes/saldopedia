'use client';

import dynamic from 'next/dynamic';

const CookieBanner = dynamic(() => import('./cookie-banner'), { ssr: false });

export default function CookieBannerClient() {
  return <CookieBanner />;
}
