import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "@/lib/db-url";
import crypto from "crypto";
import { getIPGeolocation, checkImpossibleTravel, isVPNOrProxy } from "./geolocation";

export interface BrowserFingerprintData {
  canvasHash?: string;
  webglHash?: string;
  timezone?: string;
  screenResolution?: string;
  combinedHash?: string;
}

export interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  sessionId: string;
  timestamp: Date;
  browserFingerprint?: BrowserFingerprintData;
}

export interface GeoData {
  country: string;
  city: string;
  lat: number;
  lon: number;
  isVpnProxy: boolean;
}

export interface SecurityCheckResult {
  allowed: boolean;
  error?: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresDelay: boolean;
  delayMs: number;
}

export function extractSecurityContext(request: NextRequest, sessionId: string): SecurityContext {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ipAddress = cfConnectingIp || realIp || forwarded?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  const fingerprintData = `${ipAddress}|${userAgent}|${sessionId}`;
  const deviceFingerprint = crypto
    .createHash("sha256")
    .update(fingerprintData)
    .digest("hex")
    .substring(0, 32);

  return {
    ipAddress,
    userAgent,
    deviceFingerprint,
    sessionId,
    timestamp: new Date(),
  };
}

export interface EnhancedSecurityCheckResult extends SecurityCheckResult {
  geoData?: GeoData;
  isImpossibleTravel?: boolean;
  isBrowserFingerprintMismatch?: boolean;
}

export async function checkTransactionSecurity(
  userId: number,
  transactionType: 'transfer' | 'withdrawal',
  amount: number,
  context: SecurityContext
): Promise<EnhancedSecurityCheckResult> {
  const sql = neon(getDatabaseUrl());
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let requiresDelay = false;
  let delayMs = 0;
  let geoData: GeoData | undefined;
  let isImpossibleTravel = false;
  let isBrowserFingerprintMismatch = false;

  // 1. Rate limiting check
  const recentTransactions = await sql`
    SELECT COUNT(*) as count FROM (
      SELECT created_at FROM saldo_transfers WHERE sender_id = ${userId} AND created_at > NOW() - INTERVAL '1 hour'
      UNION ALL
      SELECT created_at FROM withdrawals WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '1 hour'
    ) as recent
  `;
  
  const hourlyCount = parseInt(recentTransactions[0]?.count || '0');
  
  if (hourlyCount >= 5) {
    return {
      allowed: false,
      error: "Terlalu banyak transaksi dalam 1 jam terakhir. Maksimal 5 transaksi per jam.",
      riskLevel: 'high',
      requiresDelay: true,
      delayMs: 10000,
    };
  }

  // 2. Geolocation check
  const geoResult = await getIPGeolocation(context.ipAddress);
  if (geoResult.success && geoResult.data) {
    geoData = {
      country: geoResult.data.country,
      city: geoResult.data.city,
      lat: geoResult.data.lat,
      lon: geoResult.data.lon,
      isVpnProxy: isVPNOrProxy(geoResult.data),
    };

    // VPN/Proxy detection - BLOCK high-value transactions
    if (geoData.isVpnProxy) {
      if (amount >= 500000) {
        return {
          allowed: false,
          error: "Transaksi dari VPN/Proxy tidak diizinkan untuk nominal besar. Nonaktifkan VPN dan coba lagi.",
          riskLevel: 'high',
          requiresDelay: true,
          delayMs: 10000,
          geoData,
        };
      }
      riskLevel = 'high';
      requiresDelay = true;
      delayMs = Math.max(delayMs, 5000);
    }

    // 3. Impossible travel detection
    const lastTransaction = await sql`
      SELECT geo_lat, geo_lon, created_at 
      FROM transaction_security_logs 
      WHERE user_id = ${userId} 
        AND geo_lat IS NOT NULL 
        AND geo_lon IS NOT NULL
        AND status = 'success'
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (lastTransaction.length > 0 && geoData.lat !== 0 && geoData.lon !== 0) {
      const last = lastTransaction[0];
      const travelCheck = checkImpossibleTravel(
        parseFloat(last.geo_lat),
        parseFloat(last.geo_lon),
        new Date(last.created_at),
        geoData.lat,
        geoData.lon,
        context.timestamp
      );

      if (travelCheck.riskLevel === 'critical') {
        isImpossibleTravel = true;
        return {
          allowed: false,
          error: travelCheck.message || "Deteksi perpindahan lokasi tidak wajar. Transaksi diblokir untuk keamanan.",
          riskLevel: 'high',
          requiresDelay: true,
          delayMs: 10000,
          geoData,
          isImpossibleTravel: true,
        };
      } else if (travelCheck.riskLevel === 'high') {
        isImpossibleTravel = true;
        riskLevel = 'high';
        requiresDelay = true;
        delayMs = Math.max(delayMs, 8000);
      } else if (travelCheck.riskLevel === 'medium') {
        if (riskLevel === 'low') riskLevel = 'medium';
        requiresDelay = true;
        delayMs = Math.max(delayMs, 3000);
      }
    }
  }

  // 4. Browser fingerprint mismatch check
  if (context.browserFingerprint?.combinedHash) {
    const recentFingerprints = await sql`
      SELECT DISTINCT browser_fingerprint 
      FROM transaction_security_logs
      WHERE user_id = ${userId}
        AND created_at > NOW() - INTERVAL '7 days'
        AND browser_fingerprint IS NOT NULL
        AND status = 'success'
      ORDER BY browser_fingerprint
      LIMIT 5
    `;

    if (recentFingerprints.length > 0) {
      const knownFingerprints = recentFingerprints.map(r => r.browser_fingerprint);
      if (!knownFingerprints.includes(context.browserFingerprint.combinedHash)) {
        isBrowserFingerprintMismatch = true;
        if (riskLevel === 'low') riskLevel = 'medium';
        requiresDelay = true;
        delayMs = Math.max(delayMs, 3000);
        
        // New device + high amount = high risk
        if (amount >= 500000) {
          riskLevel = 'high';
          delayMs = Math.max(delayMs, 5000);
        }
      }
    }
  }

  // 5. Multi-IP check (existing)
  const recentIPs = await sql`
    SELECT DISTINCT ip_address FROM transaction_security_logs
    WHERE user_id = ${userId}
      AND created_at > NOW() - INTERVAL '24 hours'
      AND ip_address IS NOT NULL
      AND ip_address != ${context.ipAddress}
  `;

  const distinctIPs = recentIPs.length;
  
  if (distinctIPs >= 2) {
    riskLevel = 'high';
    requiresDelay = true;
    delayMs = Math.max(delayMs, 5000);
  } else if (distinctIPs >= 1) {
    if (riskLevel === 'low') riskLevel = 'medium';
    requiresDelay = true;
    delayMs = Math.max(delayMs, 3000);
  }

  // 6. Amount-based risk (existing)
  if (amount >= 1000000) {
    riskLevel = 'high';
    requiresDelay = true;
    delayMs = Math.max(delayMs, 5000);
  } else if (amount >= 500000) {
    if (riskLevel === 'low') riskLevel = 'medium';
    requiresDelay = true;
    delayMs = Math.max(delayMs, 3000);
  } else if (amount >= 100000) {
    requiresDelay = true;
    delayMs = Math.max(delayMs, 1000);
  }

  return {
    allowed: true,
    riskLevel,
    requiresDelay,
    delayMs,
    geoData,
    isImpossibleTravel,
    isBrowserFingerprintMismatch,
  };
}

export interface LogSecurityOptions {
  geoData?: GeoData;
  riskLevel?: string;
}

export async function logTransactionSecurity(
  userId: number,
  transactionType: 'transfer' | 'withdrawal' | 'deposit',
  transactionId: string,
  amount: number,
  context: SecurityContext,
  status: 'success' | 'failed' | 'blocked',
  failReason?: string,
  options?: LogSecurityOptions
): Promise<void> {
  const sql = neon(getDatabaseUrl());
  
  try {
    const fp = context.browserFingerprint;
    const geo = options?.geoData;
    
    await sql`
      INSERT INTO transaction_security_logs (
        user_id, transaction_type, transaction_id, amount,
        ip_address, user_agent, device_fingerprint, session_id,
        canvas_fingerprint, webgl_fingerprint, browser_fingerprint,
        timezone, screen_resolution,
        geo_country, geo_city, geo_lat, geo_lon, is_vpn_proxy,
        risk_level, status, fail_reason, created_at
      ) VALUES (
        ${userId}, ${transactionType}, ${transactionId}, ${amount},
        ${context.ipAddress}, ${context.userAgent.substring(0, 500)}, 
        ${context.deviceFingerprint}, ${context.sessionId},
        ${fp?.canvasHash || null}, ${fp?.webglHash || null}, ${fp?.combinedHash || null},
        ${fp?.timezone || null}, ${fp?.screenResolution || null},
        ${geo?.country || null}, ${geo?.city || null}, 
        ${geo?.lat || null}, ${geo?.lon || null}, ${geo?.isVpnProxy || false},
        ${options?.riskLevel || null}, ${status}, ${failReason || null}, 
        ${context.timestamp.toISOString()}
      )
    `;
  } catch (error) {
    console.error("Error logging transaction security:", error);
  }
}

export async function checkDuplicatePhone(phone: string, excludeUserId?: number): Promise<boolean> {
  if (!phone || phone.trim() === '') return false;
  
  const sql = neon(getDatabaseUrl());
  
  const normalizedPhone = normalizePhoneNumber(phone);
  
  let result;
  if (excludeUserId) {
    result = await sql`
      SELECT id FROM users 
      WHERE phone = ${normalizedPhone} 
        AND id != ${excludeUserId}
      LIMIT 1
    `;
  } else {
    result = await sql`
      SELECT id FROM users 
      WHERE phone = ${normalizedPhone}
      LIMIT 1
    `;
  }
  
  return result.length > 0;
}

export function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\D/g, '');
  
  if (normalized.startsWith('62')) {
    normalized = '0' + normalized.substring(2);
  } else if (normalized.startsWith('+62')) {
    normalized = '0' + normalized.substring(3);
  }
  
  if (!normalized.startsWith('0') && normalized.length >= 9) {
    normalized = '0' + normalized;
  }
  
  return normalized;
}

export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: true };
  }
  
  const normalized = normalizePhoneNumber(phone);
  
  if (normalized.length < 10 || normalized.length > 15) {
    return { 
      valid: false, 
      error: 'Nomor telepon harus 10-15 digit' 
    };
  }
  
  if (!normalized.startsWith('08')) {
    return { 
      valid: false, 
      error: 'Nomor telepon harus dimulai dengan 08' 
    };
  }
  
  return { valid: true };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
