import fs from 'node:fs';
import postgres from 'postgres';
import { hashPassword, randomPassword } from './_hash.mjs';

const sql = postgres(process.env.DATABASE_URL);
await sql.unsafe(fs.readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
const rows = await sql`select 1 from admin where id = 1`;
if (!rows.length) {
  const login = process.env.ADMIN_LOGIN || 'owner';
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || randomPassword();
  await sql`insert into admin (id, login, password_hash) values (1, ${login}, ${hashPassword(password)})`;
  console.log('Владелец создан. Логин:', login);
  if (generated) console.log('Пароль (сохраните, больше не покажется):', password);
}
console.log('База готова');
await sql.end();
