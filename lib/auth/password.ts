import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password minimal 8 karakter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung minimal 1 huruf besar' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung minimal 1 huruf kecil' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung minimal 1 angka' };
  }
  
  return { valid: true };
}
