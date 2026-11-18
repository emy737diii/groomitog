import crypto from 'node:crypto';
import { sql } from './db';

export function clientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}
export function ipHash(ip: string) {
  return crypto.createHash('sha256').update((process.env.IP_HASH_SALT ?? '') + ip).digest('hex').slice(0, 32);
}
/** true — можно, false — лимит исчерпан. Хранит события в БД, поэтому работает и при нескольких процессах. */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  if (Math.random() < 0.02) await sql`delete from rate_events where at < now() - interval '1 day'`;
  const [{ count }] = await sql`select count(*)::int as count from rate_events where key = ${key} and at > now() - make_interval(secs => ${windowSec})`;
  if (count >= limit) return false;
  await sql`insert into rate_events (key) values (${key})`;
  return true;
}
