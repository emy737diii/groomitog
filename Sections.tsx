import { GALLERY, MODELS, PHOTO_CREDIT, type Settings } from '@/lib/content';

export function Gallery() {
  return (
    <section id="gallery"><div className="wrap">
      <div className="sec-head"><h2 className="h2">Наши гости</h2></div>
      <div className="strip">
        {GALLERY.map((g) => <figure key={g.photo}><img loading="lazy" src={g.photo} alt={g.alt} /><figcaption>{g.caption}</figcaption></figure>)}
      </div>
    </div></section>
  );
}
export function Steps() {
  const steps = [
    ['Рассчитайте', 'Укажите вес, шерсть и услугу. Можно сразу несколько питомцев.'],
    ['Отправьте заявку', 'Добавьте фото и удобное время. Вы получите личную ссылку на статус.'],
    ['Получите подтверждение', 'Салон назовёт точное время и цену. Статус обновится по ссылке.'],
  ];
  return (
    <section id="how"><div className="wrap">
      <div className="sec-head"><h2 className="h2">Как записаться</h2></div>
      <div className="steps">{steps.map(([t, d], i) => <div className="step" key={t}><b>{i + 1}</b><h3 className="h3">{t}</h3><p className="muted">{d}</p></div>)}</div>
    </div></section>
  );
}
export function Contacts({ s }: { s: Settings }) {
  const tel = 'tel:' + s.phone.replace(/[^\d+]/g, '');
  return (
    <section id="contacts"><div className="wrap">
      <div className="sec-head"><h2 className="h2">Контакты</h2></div>
      <div className="contacts">
        <div className="panel"><h3 className="h3">Филиалы</h3><div className="muted" style={{ marginTop: 10 }}>{s.branches.map((b) => <div key={b}>{b}</div>)}</div></div>
        <div className="panel"><h3 className="h3">Часы работы</h3><p className="muted">{s.hours}</p></div>
        <div className="panel"><h3 className="h3">Телефон</h3><p><a href={tel}>{s.phone}</a></p><a className="btn btn-irid btn-sm" href={tel}>Позвонить</a></div>
      </div>
    </div></section>
  );
}
export function Footer({ name }: { name: string }) {
  return (
    <footer><div className="wrap">
      <p>© {new Date().getFullYear()} {name}</p>
      <details id="policy"><summary style={{ cursor: 'pointer' }}>Политика обработки персональных данных</summary>
        {/* ЗАМЕНИТЕ текст ниже на политику конкретного салона перед запуском */}
        <p>Здесь размещается политика обработки персональных данных салона: кто оператор, какие данные собираются (имя, телефон, фото питомца), зачем, сколько хранятся и как отозвать согласие.</p>
      </details>
      <p>{PHOTO_CREDIT} {MODELS.dog.credit}. {MODELS.cat.credit}.</p>
    </div></footer>
  );
}
