'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { MODELS, PHRASES } from '@/lib/content';

// three.js грузится отдельным файлом и только в браузере: основная страница открывается быстро.
const Pet3D = dynamic(() => import('./Pet3D'), { ssr: false, loading: () => <div className="poster3d">Загружаем 3D…</div> });
type Kind = 'dog' | 'cat';

export default function Stage({ catEnabled, phrasesEnabled }: { catEnabled: boolean; phrasesEnabled: boolean }) {
  const [pet, setPet] = useState<Kind>('dog');
  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [reset, setReset] = useState(0);
  const next = useCallback(() => {
    setHidden(true);
    window.setTimeout(() => { setI((n) => n + 1); setHidden(false); }, 300);
  }, []);
  useEffect(() => {
    if (!phrasesEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => { if (!document.hidden) next(); }, 5200);
    return () => window.clearInterval(id);
  }, [phrasesEnabled, next]);
  const list = PHRASES[pet];
  return (
    <div>
      <div className="stage">
        <div className="orb" />
        <span className="bubble" style={{ width: 64, height: 64, left: '-2%', top: '18%', animationDuration: '11s' }} />
        <span className="bubble" style={{ width: 34, height: 34, left: '10%', top: '70%', animationDuration: '9s', animationDelay: '-3s' }} />
        <span className="bubble" style={{ width: 90, height: 90, right: '-4%', top: '58%', animationDuration: '14s', animationDelay: '-5s' }} />
        <span className="bubble" style={{ width: 22, height: 22, right: '18%', top: '12%', animationDuration: '8s', animationDelay: '-2s' }} />
        <div className="canvas3d"><Pet3D key={pet} file={MODELS[pet].file} onTap={next} resetSignal={reset} /></div>
        {phrasesEnabled && <button type="button" className={'speech' + (hidden ? ' hide' : '')} onClick={next} style={{ border: 0, cursor: 'pointer', textAlign: 'left' }}>{list[i % list.length]}</button>}
        {catEnabled && (
          <div className="stage-ui seg" role="group" aria-label="Кого показать">
            {(['dog', 'cat'] as const).map((k) => (
              <button key={k} type="button" aria-pressed={pet === k} onClick={() => { setPet(k); setI(0); }}>{k === 'dog' ? 'Собака' : 'Кошка'}</button>
            ))}
          </div>
        )}
        <button type="button" className="btn btn-glass btn-sm reset3d" onClick={() => setReset((n) => n + 1)} aria-label="Вернуть вид">↺</button>
      </div>
      <p className="attr">{MODELS[pet].credit}</p>
    </div>
  );
}
