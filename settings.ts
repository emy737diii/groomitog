import { sql } from './db';
import { DEFAULT_SETTINGS, type Settings } from './content';
import { DEFAULT_TARIFFS, type Tariffs } from './pricing';

// Если база ещё не подключена, сайт всё равно открывается с настройками по умолчанию.
export async function getSettings(): Promise<Settings> {
  try {
    const [row] = await sql`select data from settings where id = 1`;
    return { ...DEFAULT_SETTINGS, ...((row?.data as Partial<Settings>) ?? {}) };
  } catch (e) { console.error('База недоступна, настройки по умолчанию', (e as Error).message); return DEFAULT_SETTINGS; }
}
export async function getTariffs(): Promise<Tariffs> {
  try {
    const [row] = await sql`select data from tariffs where id = 1`;
    return { ...DEFAULT_TARIFFS, ...((row?.data as Partial<Tariffs>) ?? {}) };
  } catch { return DEFAULT_TARIFFS; }
}
export async function saveSettings(s: Settings) {
  const json = JSON.stringify(s);
  await sql`insert into settings (id, data) values (1, ${json}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
}
export async function saveTariffs(t: Tariffs) {
  const json = JSON.stringify(t);
  await sql`insert into tariffs (id, data) values (1, ${json}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
}
