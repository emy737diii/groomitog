// Расчёт цены. Один и тот же код работает в браузере (показ) и на сервере (снимок цены в заявке).
export type Species = 'dog' | 'cat' | 'other';
export type Size = 'xs' | 's' | 'm' | 'l' | 'xl';
export type Coat = 'short' | 'mid' | 'long' | 'wire';
export type Svc = 'full' | 'hyg' | 'wash' | 'nails';
export type Extra = 'mats' | 'shed' | 'nervous' | 'senior';
export interface Pet { species: Species; size: Size | null; coat: Coat | null; svc: Svc | null; extra: Extra[]; name: string; breed: string }
export interface PriceResult { manual: boolean; price: number }
export interface PricedPet extends Pet { res: PriceResult }
export type Tariffs = { xs: number; s: number; m: number; l: number; xl: number; mid: number; long: number; wire: number; cat: number; catLong: number; hyg: number; wash: number; nails: number; mats: number; shed: number; min: number };

export const DEFAULT_TARIFFS: Tariffs = { xs: 2000, s: 2500, m: 3300, l: 4200, xl: 5200, mid: 1.15, long: 1.3, wire: 1.4, cat: 2800, catLong: 1.2, hyg: 0.5, wash: 0.6, nails: 400, mats: 600, shed: 400, min: 1000 };

export const TARIFF_FIELDS: [keyof Tariffs, string][] = [
  ['xs', 'Собаки до 5 кг, ₽'], ['s', 'Собаки 5–10 кг, ₽'], ['m', 'Собаки 10–25 кг, ₽'], ['l', 'Собаки 25–40 кг, ₽'], ['xl', 'Собаки от 40 кг, ₽'],
  ['cat', 'Кошки, комплекс, ₽'], ['mid', 'Шерсть средняя, множитель'], ['long', 'Шерсть длинная, множитель'], ['wire', 'Шерсть жёсткая, множитель'],
  ['catLong', 'Кошки длинношёрстные, множитель'], ['hyg', 'Гигиена, доля от комплекса'], ['wash', 'Мытьё, доля от комплекса'], ['nails', 'Когти, ₽'],
  ['mats', 'Колтуны, + ₽'], ['shed', 'Линька, + ₽'], ['min', 'Минимум за питомца, ₽'],
];

export const LABELS = {
  species: { dog: 'собака', cat: 'кошка', other: 'другое животное' } as Record<Species, string>,
  size: { xs: 'до 5 кг', s: '5–10 кг', m: '10–25 кг', l: '25–40 кг', xl: 'от 40 кг' } as Record<Size, string>,
  coat: { short: 'Короткая', mid: 'Средняя', long: 'Длинная', wire: 'Жёсткая, тримминг' } as Record<Coat, string>,
  svc: { full: 'Комплекс', hyg: 'Гигиена', wash: 'Мытьё и сушка', nails: 'Только когти' } as Record<Svc, string>,
  extra: { mats: 'Колтуны', shed: 'Сильная линька', nervous: 'Нервничает', senior: 'Пожилой' } as Record<Extra, string>,
};
export const MIX_BREED = 'Метис / не знаю';

export function blankPet(species: Species = 'dog'): Pet {
  return { species, size: null, coat: null, svc: null, extra: [], name: '', breed: '' };
}
const r10 = (v: number) => Math.round(v / 10) * 10;

/** null — ещё не все параметры выбраны. price = 0 — цена только вручную (никогда не показываем как «бесплатно»). */
export function calc(p: Pet, T: Tariffs): PriceResult | null {
  if (p.species === 'other') return { manual: true, price: 0 };
  if (!p.svc || !p.coat || (p.species === 'dog' && !p.size)) return null;
  if (p.species === 'cat' && (p.coat === 'mid' || p.coat === 'wire')) return null;
  const manual = p.extra.includes('nervous') || p.extra.includes('senior');
  if (p.svc === 'nails') return { manual, price: T.nails };
  const base = p.species === 'dog'
    ? T[p.size as Size] * (p.coat === 'short' ? 1 : T[p.coat])
    : T.cat * (p.coat === 'long' ? T.catLong : 1);
  let v = base * (p.svc === 'full' ? 1 : T[p.svc]);
  if (p.extra.includes('mats')) v += T.mats;
  if (p.extra.includes('shed')) v += T.shed;
  return { manual, price: Math.max(T.min, r10(v)) };
}

export const rub = (n: number) => `${Math.round(n).toLocaleString('ru-RU')}\u00a0₽`;
export function priceText(r: PriceResult | null): string {
  if (!r) return '—';
  if (!r.price) return 'Цена уточняется';
  return (r.manual ? 'от ' : '') + rub(r.price);
}
export function total(list: PricedPet[]) {
  let sum = 0, manual = false, any = false;
  for (const p of list) { if (p.res.price) { sum += p.res.price; any = true; } if (p.res.manual) manual = true; }
  return { min: sum, manual, text: any ? (manual ? 'от ' : '') + rub(sum) : 'Цена уточняется' };
}
export function petLine(p: Pet): string {
  const d: string[] = [LABELS.species[p.species]];
  if (p.breed) d.push(p.breed);
  if (p.species === 'dog' && p.size) d.push(LABELS.size[p.size]);
  if (p.coat) d.push('шерсть ' + LABELS.coat[p.coat].toLowerCase());
  if (p.extra.length) d.push(p.extra.map((x) => LABELS.extra[x].toLowerCase()).join(', '));
  return `${p.name || 'Без клички'}: ${d.join(', ')}`;
}
export function svcLine(p: PricedPet): string {
  if (p.species === 'other') return 'Оценка вручную';
  return LABELS.svc[p.svc as Svc] + (p.res.manual ? ', цену уточнит мастер' : '');
}
export function minPrices(T: Tariffs) {
  return { dogFull: T.xs, dogWash: Math.max(T.min, r10(T.xs * T.wash)), dogHyg: Math.max(T.min, r10(T.xs * T.hyg)), catFull: T.cat, nails: T.nails };
}
