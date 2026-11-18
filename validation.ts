import { z } from 'zod';
import { PREF_TIMES, STATUS } from './content';

export const petSchema = z.object({
  species: z.enum(['dog', 'cat', 'other']),
  size: z.enum(['xs', 's', 'm', 'l', 'xl']).nullable(),
  coat: z.enum(['short', 'mid', 'long', 'wire']).nullable(),
  svc: z.enum(['full', 'hyg', 'wash', 'nails']).nullable(),
  extra: z.array(z.enum(['mats', 'shed', 'nervous', 'senior'])).max(4),
  name: z.string().trim().max(40),
  breed: z.string().trim().max(60),
});
export const requestSchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя').max(60),
  phone: z.string().trim().max(20).refine((v) => v.replace(/\D/g, '').length >= 10, 'Укажите телефон'),
  branch: z.string().trim().max(120),
  prefDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal('')),
  prefTime: z.enum(PREF_TIMES),
  comment: z.string().trim().max(600),
  consent: z.literal(true, { errorMap: () => ({ message: 'Нужно согласие на обработку данных' }) }),
  pets: z.array(petSchema).min(1).max(6),
});
export type RequestInput = z.infer<typeof requestSchema>;

export const adminUpdateSchema = z.object({
  status: z.enum(Object.keys(STATUS) as [keyof typeof STATUS, ...(keyof typeof STATUS)[]]),
  finalPrice: z.string().trim().max(40),
  finalTime: z.string().max(40),
  internalNote: z.string().trim().max(1000),
});
export const settingsSchema = z.object({
  name: z.string().trim().min(1).max(40),
  phone: z.string().trim().max(20),
  hours: z.string().trim().max(80),
  branches: z.array(z.string().trim().min(1).max(120)).min(1).max(10),
  heroTitle: z.string().trim().min(1).max(90),
  heroText: z.string().trim().max(240),
  catEnabled: z.boolean(),
  phrasesEnabled: z.boolean(),
});
const pos = z.number().positive().max(1_000_000);
export const tariffsSchema = z.object({ xs: pos, s: pos, m: pos, l: pos, xl: pos, mid: pos, long: pos, wire: pos, cat: pos, catLong: pos, hyg: pos, wash: pos, nails: pos, mats: pos, shed: pos, min: pos });
export const passwordSchema = z.object({ current: z.string().min(1), next: z.string().min(10, 'Минимум 10 символов').max(128) });
