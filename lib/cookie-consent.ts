export interface CookieConsent {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentWithTimestamp extends CookieConsent {
  timestamp: number;
  version: string;
}

const COOKIE_CONSENT_KEY = 'saldopedia_cookie_consent';
const COOKIE_CONSENT_VERSION = '1.0';

export const defaultConsent: CookieConsent = {
  necessary: true, // Always true, can't be disabled
  preferences: false,
  analytics: false,
  marketing: false,
};

export function getCookieConsent(): CookieConsentWithTimestamp | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    const parsed: CookieConsentWithTimestamp = JSON.parse(stored);
    
    // Check if consent is from current version
    if (parsed.version !== COOKIE_CONSENT_VERSION) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

export function saveCookieConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;

  try {
    const consentWithMeta: CookieConsentWithTimestamp = {
      ...consent,
      necessary: true, // Force necessary to always be true
      timestamp: Date.now(),
      version: COOKIE_CONSENT_VERSION,
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithMeta));
    
    // Dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consentWithMeta }));
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.dispatchEvent(new Event('cookieConsentCleared'));
  } catch (error) {
    console.error('Error clearing cookie consent:', error);
  }
}

export function hasUserMadeChoice(): boolean {
  return getCookieConsent() !== null;
}

// Block scripts based on consent
export function shouldLoadScript(category: keyof CookieConsent): boolean {
  const consent = getCookieConsent();
  
  if (!consent) {
    // If no consent given yet, only load necessary
    return category === 'necessary';
  }

  return consent[category] === true;
}

// Helper to get all accepted categories
export function getAcceptedCategories(): string[] {
  const consent = getCookieConsent();
  if (!consent) return ['necessary'];

  const categories: string[] = [];
  const keys: Array<keyof CookieConsent> = ['necessary', 'preferences', 'analytics', 'marketing'];
  
  keys.forEach((key) => {
    if (consent[key]) {
      categories.push(key);
    }
  });

  return categories;
}
