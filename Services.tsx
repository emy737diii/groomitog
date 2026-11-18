'use client';
import { SERVICES, type PriceKey } from '@/lib/content';
import { rub } from '@/lib/pricing';

export default function Services({ from }: { from: Record<PriceKey, number> }) {
  const pick = (p: readonly [string, string]) => window.dispatchEvent(new CustomEvent('grm:pick', { detail: { species: p[0], svc: p[1] } }));
  return (
    <section id="services"><div className="wrap">
      <div className="sec-head"><div><h2 className="h2">Услуги</h2><p className="muted">Цены указаны «от». Точная сумма зависит от веса и шерсти.</p></div><a className="btn btn-glass btn-sm" href="#calc">Рассчитать свою</a></div>
      <div className="bento">
        {SERVICES.map((s) => (
          <a key={s.title} href="#calc" onClick={() => pick(s.pick)} className={['svc', s.size, s.photo ? '' : 'plain'].filter(Boolean).join(' ')}>
            {s.photo && <img loading="lazy" src={s.photo} alt={s.alt ?? ''} />}
            <span className="price">{s.from === 'nails' ? '' : 'от '}{rub(from[s.from])}</span>
            <h3 className="h3">{s.title}</h3>
            {s.text && <p>{s.text}</p>}
            {s.meta && <span className="meta">{s.meta}</span>}
          </a>
        ))}
      </div>
    </div></section>
  );
}
