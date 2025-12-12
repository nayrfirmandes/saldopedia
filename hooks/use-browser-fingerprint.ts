'use client';

import { useState, useEffect } from 'react';
import { collectBrowserFingerprint, type BrowserFingerprint } from '@/lib/security/browser-fingerprint';

export function useBrowserFingerprint() {
  const [fingerprint, setFingerprint] = useState<BrowserFingerprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const fp = collectBrowserFingerprint();
      setFingerprint(fp);
    } catch (error) {
      console.error('Failed to collect browser fingerprint:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFingerprintData = () => {
    if (!fingerprint) return null;
    return {
      canvasHash: fingerprint.canvasHash,
      webglHash: fingerprint.webglHash,
      timezone: fingerprint.timezone,
      screenResolution: fingerprint.screenResolution,
      combinedHash: fingerprint.combinedHash,
    };
  };

  return {
    fingerprint,
    isLoading,
    getFingerprintData,
  };
}
