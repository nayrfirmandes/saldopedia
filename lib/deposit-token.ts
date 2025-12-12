import crypto from 'crypto';
import { getPrimaryDomain } from './order-token';

function getSecretKey(): string {
  const secret = process.env.ORDER_COMPLETION_SECRET;
  
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'ORDER_COMPLETION_SECRET environment variable is required for secure deposit confirmation.'
    );
  }
  
  if (secret.length < 32) {
    throw new Error(
      'ORDER_COMPLETION_SECRET must be at least 32 characters long for adequate security.'
    );
  }
  
  return secret;
}

export function generateDepositToken(depositId: string): string {
  const secretKey = getSecretKey();
  const timestamp = Date.now().toString();
  const payload = `deposit:${depositId}:${timestamp}`;
  
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(payload);
  const hash = hmac.digest('hex');
  
  return `${hash}.${timestamp}`;
}

export function validateDepositToken(depositId: string, token: string): boolean {
  try {
    const secretKey = getSecretKey();
    const [hash, timestampStr] = token.split('.');
    
    if (!hash || !timestampStr) {
      return false;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    if (now - timestamp > TWENTY_FOUR_HOURS) {
      return false;
    }
    
    const payload = `deposit:${depositId}:${timestampStr}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(payload);
    const expectedHash = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch (error) {
    console.error('Deposit token validation error:', error);
    return false;
  }
}

export function getDepositConfirmUrl(depositId: string): string {
  const token = generateDepositToken(depositId);
  const baseUrl = getPrimaryDomain();
  const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
  
  return `${protocol}://${baseUrl}/api/deposits/confirm/${depositId}?token=${token}`;
}

export function getDepositRejectUrl(depositId: string): string {
  const token = generateDepositToken(depositId);
  const baseUrl = getPrimaryDomain();
  const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
  
  return `${protocol}://${baseUrl}/api/deposits/reject/${depositId}?token=${token}`;
}
