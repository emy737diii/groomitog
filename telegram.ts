import { sql } from './db';
import { petLine, svcLine, type PricedPet } from './pricing';

const api = (method: string) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
export const tgConfigured = () => !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME);
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function tgSend(chatId: number | string, html: string) {
  const res = await fetch(api('sendMessage'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
}
export async function tgSendPhotos(chatId: number | string, photos: { mime: string; data: Buffer }[]) {
  if (!photos.length) return;
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('media', JSON.stringify(photos.map((_, i) => ({ type: 'photo', media: `attach://p${i}` }))));
  photos.forEach((p, i) => fd.append(`p${i}`, new Blob([p.data.buffer.slice(p.data.byteOffset, p.data.byteOffset + p.data.byteLength) as ArrayBuffer], { type: p.mime }), `p${i}.jpg`));
  const res = await fetch(api('sendMediaGroup'), { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
}

export type RequestForMessage = { no: number; name: string; phone: string; branch: string; pref_date: string | Date | null; pref_time: string; comment: string; pets: PricedPet[]; total_text: string; photoCount: number };
export function requestMessage(r: RequestForMessage) {
  const date = r.pref_date ? new Date(r.pref_date).toLocaleDateString('ru-RU', { timeZone: 'UTC' }) : '';
  const pref = [date, r.pref_time !== 'Неважно' ? r.pref_time.toLowerCase() : ''].filter(Boolean).join(', ') || 'не указано';
  const pets = r.pets.map((p) => `• ${esc(petLine(p))}\n   ${esc(svcLine(p))}`).join('\n');
  const site = process.env.SITE_URL ?? '';
  return [
    `🐾 <b>Новая заявка № ${r.no}</b>`,
    `Клиент: ${esc(r.name)}`,
    `Телефон: ${esc(r.phone)}`,
    r.branch ? `Филиал: ${esc(r.branch)}` : '',
    `Пожелание: ${esc(pref)}`,
    '', '<b>Питомцы</b>', pets, '',
    `Итого предварительно: <b>${esc(r.total_text)}</b>`,
    r.comment ? `Комментарий: ${esc(r.comment)}` : '',
    `Фото: ${r.photoCount}`,
    site ? `\n${site}/admin` : '',
  ].filter((l) => l !== '').join('\n').replace('\n\n\n', '\n\n');
}

/** Отправляет заявку владельцу. Ошибки только логируются: заявка уже сохранена в базе и видна в кабинете. */
export async function notifyNewRequest(requestId: number) {
  try {
    if (!tgConfigured()) return;
    const [tg] = await sql`select chat_id from telegram where id = 1`;
    if (!tg?.chat_id) return;
    const [r] = await sql`select no, name, phone, branch, pref_date, pref_time, comment, pets, total_text from requests where id = ${requestId}`;
    if (!r) return;
    const photos = await sql`select mime, data from request_photos where request_id = ${requestId} order by id`;
    await tgSend(tg.chat_id, requestMessage({ ...(r as unknown as RequestForMessage), photoCount: photos.length }));
    await tgSendPhotos(tg.chat_id, photos.map((p) => ({ mime: p.mime as string, data: p.data as Buffer })));
  } catch (e) {
    console.error('Не удалось отправить заявку в Telegram', e);
  }
}
