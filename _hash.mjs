import crypto from 'node:crypto';
// Формат: scrypt:N:r:p:salt:hash (base64). Тот же формат проверяет lib/auth.ts
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:16384:8:1:${salt.toString('base64')}:${hash.toString('base64')}`;
}
export function randomPassword() {
  const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const b = crypto.randomBytes(14);
  let s = '';
  for (let i = 0; i < b.length; i++) s += abc[b[i] % abc.length];
  return `${s.slice(0, 4)}-${s.slice(4, 9)}-${s.slice(9)}`;
}
