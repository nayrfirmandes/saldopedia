import crypto from 'crypto';
import { getPrimaryDomain } from './order-token';

function getSecretKey(): string {
  const secret = process.env.ORDER_COMPLETION_SECRET;
  
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'ORDER_COMPLETION_SECRET environment variable is required for secure withdrawal completion.'
    );
  }
  
  if (secret.length < 32) {
    throw new Error(
      'ORDER_COMPLETION_SECRET must be at least 32 characters long for adequate security.'
    );
  }
  
  return secret;
}

export function generateWithdrawalToken(withdrawalId: string): string {
  const secretKey = getSecretKey();
  const timestamp = Date.now().toString();
  const payload = `withdrawal:${withdrawalId}:${timestamp}`;
  
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(payload);
  const hash = hmac.digest('hex');
  
  return `${hash}.${timestamp}`;
}

export function validateWithdrawalToken(withdrawalId: string, token: string): boolean {
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
    
    const payload = `withdrawal:${withdrawalId}:${timestampStr}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(payload);
    const expectedHash = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch (error) {
    console.error('Withdrawal token validation error:', error);
    return false;
  }
}

export function getWithdrawalCompleteUrl(withdrawalId: string): string {
  const token = generateWithdrawalToken(withdrawalId);
  const baseUrl = getPrimaryDomain();
  const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
  
  return `${protocol}://${baseUrl}/api/withdrawals/complete/${withdrawalId}?token=${token}`;
}

export function getWithdrawalRejectUrl(withdrawalId: string): string {
  const token = generateWithdrawalToken(withdrawalId);
  const baseUrl = getPrimaryDomain();
  const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
  
  return `${protocol}://${baseUrl}/api/withdrawals/reject/${withdrawalId}?token=${token}`;
}
