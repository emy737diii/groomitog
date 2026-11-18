import postgres from 'postgres';

const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres> };

// Одно подключение на процесс. Все запросы через tagged template: параметры экранируются автоматически.
export const sql = g.__sql ?? postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/none', { max: 10, idle_timeout: 20, connect_timeout: 5 });
if (process.env.NODE_ENV !== 'production') g.__sql = sql;
