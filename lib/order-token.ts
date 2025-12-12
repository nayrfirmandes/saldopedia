import crypto from 'crypto';

// Get secret key from environment - fail fast if not configured
function getSecretKey(): string {
  const secret = process.env.ORDER_COMPLETION_SECRET;
  
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'ORDER_COMPLETION_SECRET environment variable is required for secure order completion. ' +
      'Please configure a strong random secret (minimum 32 characters).'
    );
  }
  
  if (secret.length < 32) {
    throw new Error(
      'ORDER_COMPLETION_SECRET must be at least 32 characters long for adequate security.'
    );
  }
  
  return secret;
}

/**
 * Generate a secure token for one-click order completion
 * Token is HMAC-SHA256 hash of orderId + timestamp
 */
export function generateCompletionToken(orderId: string): string {
  const secretKey = getSecretKey(); // Will throw if not configured
  const timestamp = Date.now().toString();
  const payload = `${orderId}:${timestamp}`;
  
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(payload);
  const hash = hmac.digest('hex');
  
  // Return token with timestamp for validation
  return `${hash}.${timestamp}`;
}

/**
 * Validate completion token
 * Returns true if token is valid and not expired (24 hours)
 */
export function validateCompletionToken(orderId: string, token: string): boolean {
  try {
    const secretKey = getSecretKey(); // Will throw if not configured
    const [hash, timestampStr] = token.split('.');
    
    if (!hash || !timestampStr) {
      return false;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    
    // Token expires after 24 hours
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    if (now - timestamp > TWENTY_FOUR_HOURS) {
      return false;
    }
    
    // Regenerate hash and compare
    const payload = `${orderId}:${timestampStr}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(payload);
    const expectedHash = hmac.digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Get primary domain - use environment-based URL for proper routing
 * 
 * Priority order:
 * 1. CUSTOM_DOMAIN (production custom domain - MUST be set in Replit Secrets)
 * 2. NEXT_PUBLIC_APP_URL (explicit public URL)
 * 3. REPLIT_DEV_DOMAIN (Replit development domain)
 * 4. Fallback to saldopedia.com
 * 
 * NOTE: When you connect a custom domain to Replit deployment, you MUST manually
 * set CUSTOM_DOMAIN environment variable in Replit Secrets. Replit does not 
 * automatically provide the custom domain via environment variables.
 */
export function getPrimaryDomain(): string {
  // Priority 1: Custom domain (for production with custom domain connected)
  // This MUST be set manually in Replit Secrets when using custom domain
  const customDomain = process.env.CUSTOM_DOMAIN;
  if (customDomain) {
    return customDomain;
  }
  
  // Priority 2: Explicit public URL from environment
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
      .replace(/^https?:\/\//, '')  // Remove protocol
      .replace(/\/$/, '');            // Remove trailing slash
  }
  
  // Priority 3: Replit development domain (for workspace)
  if (process.env.REPLIT_DEV_DOMAIN) {
    return process.env.REPLIT_DEV_DOMAIN;
  }
  
  // Fallback: Use saldopedia.com (production custom domain)
  return 'saldopedia.com';
}

/**
 * Generate completion URL for admin CTA button
 */
export function getCompletionUrl(orderId: string): string {
  const token = generateCompletionToken(orderId);
  const baseUrl = getPrimaryDomain();
  const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
  
  return `${protocol}://${baseUrl}/api/orders/complete/${orderId}?token=${token}`;
}

/**
 * Generate rejection URL for admin CTA button
 */
export function getRejectUrl(orderId: string): string {
  const token = generateCompletionToken(orderId);
  const baseUrl = getPrimaryDomain();
  const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
  
  return `${protocol}://${baseUrl}/api/orders/reject/${orderId}?token=${token}`;
}
