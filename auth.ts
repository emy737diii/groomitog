import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { sql } from './db';

const COOKIE = 'grm_session';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 дней

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET не задан или короче 32 символов');
  return s;
}
const sign = (payload: string) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:16384:8:1:${salt.toString('base64')}:${hash.toString('base64')}`;
}
export function verifyPassword(password: string, stored: string) {
  const [alg, N, r, p, salt, hash] = stored.split(':');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const got = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(expected, got);
}

export async function createSession(version: number) {
  const payload = Buffer.from(JSON.stringify({ v: version, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: MAX_AGE,
  });
}
export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Проверяет подпись и срок cookie, а также что пароль не менялся после входа (session_version). */
export async function isAdmin(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig || !safeEqual(sign(payload), sig)) return false;
  let data: { v?: unknown; exp?: unknown };
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return false; }
  if (typeof data.exp !== 'number' || data.exp < Date.now()) return false;
  const [row] = await sql`select session_version from admin where id = 1`;
  return !!row && row.session_version === data.v;
}

/** Для API кабинета: null — доступ есть, иначе готовый ответ 401/403. Для изменяющих запросов сверяет Origin (защита от CSRF). */
export async function guardAdmin(req: Request): Promise<Response | null> {
  if (req.method !== 'GET' && !sameOrigin(req)) return Response.json({ error: 'bad_origin' }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: 'unauthorized' }, { status: 401 });
  return null;
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  try { return new URL(origin).host === host; } catch { return false; }
}
