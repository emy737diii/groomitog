import postgres from 'postgres';
import { hashPassword, randomPassword } from './_hash.mjs';

// Сброс пароля владельца: npm run admin:password -- "НовыйПароль" (без аргумента сгенерируется)
const sql = postgres(process.env.DATABASE_URL);
const password = process.argv[2] || randomPassword();
if (password.length < 10) { console.error('Минимум 10 символов'); process.exit(1); }
const r = await sql`update admin set password_hash = ${hashPassword(password)}, session_version = session_version + 1, updated_at = now() where id = 1 returning login`;
if (!r.length) console.error('Сначала запустите npm run db:migrate');
else console.log('Пароль для', r[0].login, 'обновлён:', password, '\nВсе старые входы завершены.');
await sql.end();
