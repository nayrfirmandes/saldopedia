import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from '@/lib/db-url';

export async function generateUniqueUserId(): Promise<number> {
  const sql = neon(getDatabaseUrl());
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const randomId = Math.floor(1000000 + Math.random() * 9000000);
    
    const existing = await sql`SELECT id FROM users WHERE id = ${randomId} LIMIT 1`;
    
    if (existing.length === 0) {
      return randomId;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique user ID after maximum attempts');
}
