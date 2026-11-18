// Всё, что меняется под конкретный салон в коде: фото, тексты услуг, фразы питомцев, 3D-модели.
// Название, телефон, часы, филиалы и тарифы владелец меняет сам в кабинете.
import type { Species, Svc } from './pricing';

export type Settings = { name: string; phone: string; hours: string; branches: string[]; heroTitle: string; heroText: string; catEnabled: boolean; phrasesEnabled: boolean };
export const DEFAULT_SETTINGS: Settings = {
  name: 'Шёрстка', phone: '+7 900 000-00-00', hours: 'Ежедневно 10:00–21:00', branches: ['Филиал на Садовой', 'Филиал на Лесной'],
  heroTitle: 'Груминг, после которого хочется обниматься',
  heroText: 'Комплекс, стрижка и мытьё для собак и кошек. Рассчитайте стоимость за минуту, а мастер подтвердит время и цену.',
  catEnabled: true, phrasesEnabled: true,
};

const u = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`;
export type PriceKey = 'dogFull' | 'dogWash' | 'dogHyg' | 'catFull' | 'nails';
export const SERVICES: { title: string; text?: string; meta?: string; photo?: string; alt?: string; size?: 'big' | 'wide'; pick: [Species, Svc]; from: PriceKey }[] = [
  { title: 'Комплекс для собак', text: 'Мытьё, сушка, стрижка по породе или под машинку, когти и уши. Всё за один визит.', meta: '≈ 2–3 часа', photo: u('photo-1528846104175-4fd300ee59da', 1200), alt: 'Мастер расчёсывает белую собаку', size: 'big', pick: ['dog', 'full'], from: 'dogFull' },
  { title: 'Мытьё и сушка', meta: '≈ 1 час', photo: u('photo-1581887936036-3f4f7f0b6679'), alt: 'Мокрая собака в полотенце', pick: ['dog', 'wash'], from: 'dogWash' },
  { title: 'Гигиена', meta: 'Мордочка, лапы, интимные зоны', photo: u('photo-1719464454959-9cf304ef4774'), alt: 'Грумер подстригает мордочку ножницами', pick: ['dog', 'hyg'], from: 'dogHyg' },
  { title: 'Кошки', text: 'Вычёсывание подшёрстка, колтуны, стрижка «под льва». Спокойно и без спешки.', photo: u('photo-1747176779062-4e800093611e', 1200), alt: 'Длинношёрстную кошку вычёсывают щёткой', size: 'wide', pick: ['cat', 'full'], from: 'catFull' },
  { title: 'Когти', text: 'Аккуратно подстрижём и подпилим. 15 минут, можно без комплекса.', pick: ['dog', 'nails'], from: 'nails' },
];
export const GALLERY = [
  { photo: u('photo-1611173622933-91942d394b04', 700), alt: 'Шпиц в розовом полотенце', caption: 'После мытья: тёплое полотенце и никакой спешки' },
  { photo: u('photo-1629757201300-1fd11d306a9b', 700), alt: 'Шпиц спит на полотенце', caption: 'Сон после фена — лучший отзыв' },
  { photo: u('photo-1780732659746-8c2276f3ddc6', 700), alt: 'Черепаховую кошку расчёсывают', caption: 'Кошек вычёсываем вручную и с перерывами' },
  { photo: u('photo-1528846104175-4fd300ee59da', 700), alt: 'Белая собака на столе грумера', caption: 'Стрижка по фото, которое вы прислали' },
];
export const PHOTO_CREDIT = 'Фото: Unsplash (Karsten Winegeart и другие авторы).';
// 3D-модели: положите файлы в public/models. См. README, раздел «3D-модели».
export const MODELS = {
  dog: { file: '/models/dog.glb', credit: '3D-модель «Shiba Inu Dog» — Ida Faber, Sketchfab, CC BY 4.0' },
  cat: { file: '/models/cat.glb', credit: '3D-модель «Cat» — Suushimi, Sketchfab, CC BY-NC 4.0' },
} as const;
export const PHRASES: Record<'dog' | 'cat', string[]> = {
  dog: ['Гав! Покрути меня пальцем', 'После мытья я пахну счастьем', 'Когти стучат по полу. Пора к мастеру!', 'Рассчитай мою стрижку ниже'],
  cat: ['Мрр. Только без фена, пожалуйста', 'Колтуны? Какие колтуны?', 'Я сама решу, когда красивая', 'Мяу. Записывай на субботу'],
};
export const BREEDS = ['Шпиц', 'Йоркширский терьер', 'Мальтипу', 'Пудель', 'Шиба-ину', 'Самоед', 'Хаски', 'Корги', 'Золотистый ретривер', 'Мейн-кун', 'Британская', 'Персидская'];
export const PREF_TIMES = ['Неважно', 'Утром', 'Днём', 'Вечером'] as const;
export const STATUS = {
  new: { label: 'Новая', cls: 'b-new', step: 1, hint: 'Салон скоро посмотрит заявку и свяжется с вами.' },
  ask: { label: 'Нужно уточнение', cls: 'b-ask', step: 1, hint: 'Салон позвонит или напишет, чтобы уточнить детали.' },
  ok: { label: 'Подтверждена', cls: 'b-ok', step: 2, hint: 'Ждём вас в назначенное время.' },
  done: { label: 'Выполнена', cls: 'b-done', step: 4, hint: 'Спасибо, что выбрали нас!' },
  cancel: { label: 'Отменена', cls: 'b-cancel', step: 0, hint: 'Заявка отменена. Чтобы записаться снова, отправьте новую.' },
} as const;
export type Status = keyof typeof STATUS;
