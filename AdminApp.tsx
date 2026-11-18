'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { STATUS, type Settings, type Status } from '@/lib/content';
import { TARIFF_FIELDS, petLine, priceText, svcLine, type PricedPet, type Tariffs } from '@/lib/pricing';
import { useToast } from '../useToast';

type Tab = 'req' | 'tg' | 'price' | 'salon' | 'access';
type Req = { id: number; no: number; token: string; status: Status; name: string; phone: string; branch: string; pref_date: string | null; pref_time: string; comment: string; pets: PricedPet[]; total_text: string; final_price: string; final_time: string | null; internal_note: string; created_at: string; photo_ids: number[] };
type Tg = { configured: boolean; bot: string; linked: boolean; title: string; linkedAt: string | null; waiting: boolean };

async function api<T = unknown>(url: string, method = 'GET', body?: unknown): Promise<{ ok: boolean; data: T & { error?: string } }> {
  const r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
  if (r?.status === 401) { window.location.href = '/admin/login'; return { ok: false, data: {} as T & { error?: string } }; }
  const data = await r?.json().catch(() => ({}));
  return { ok: !!r?.ok, data: (data ?? { error: 'Нет связи с сервером' }) as T & { error?: string } };
}
const toLocalInput = (iso: string | null) => { if (!iso) return ''; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const fmtDate = (iso: string) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function ReqCard({ r, onChanged, toast }: { r: Req; onChanged: () => void; toast: (m: string) => void }) {
  const [st, setSt] = useState<Status>(r.status);
  const [price, setPrice] = useState(r.final_price);
  const [time, setTime] = useState(toLocalInput(r.final_time));
  const [note, setNote] = useState(r.internal_note);
  const s = STATUS[r.status];
  const pref = [r.pref_date ? new Date(r.pref_date).toLocaleDateString('ru-RU', { timeZone: 'UTC' }) : '', r.pref_time !== 'Неважно' ? r.pref_time.toLowerCase() : ''].filter(Boolean).join(', ') || 'не указано';
  const save = async () => {
    const { ok, data } = await api(`/api/admin/requests/${r.id}`, 'PATCH', { status: st, finalPrice: price, finalTime: time ? new Date(time).toISOString() : '', internalNote: note });
    toast(ok ? 'Сохранено. Клиент увидит статус по своей ссылке' : data.error ?? 'Не удалось сохранить');
    if (ok) onChanged();
  };
  const del = async () => {
    if (!window.confirm(`Удалить заявку № ${r.no} вместе с фото? Восстановить будет нельзя.`)) return;
    const { ok } = await api(`/api/admin/requests/${r.id}`, 'DELETE');
    toast(ok ? 'Заявка удалена' : 'Не удалось удалить'); if (ok) onChanged();
  };
  return (
    <details className="req">
      <summary><span className={'badge ' + s.cls}>{s.label}</span>
        <div style={{ flex: 1, minWidth: 0 }}><b>№ {r.no} · {r.name}</b><div className="muted small">{r.pets.map((p) => p.name || p.species).join(', ')} · {fmtDate(r.created_at)}</div></div>
        <b>{r.final_price || r.total_text}</b></summary>
      <div className="body">
        <dl className="kv">
          <dt>Телефон</dt><dd><a href={'tel:' + r.phone.replace(/[^\d+]/g, '')}>{r.phone}</a></dd>
          <dt>Филиал</dt><dd>{r.branch || 'любой'}</dd>
          <dt>Пожелание</dt><dd>{pref}</dd>
          {r.comment && <><dt>Комментарий</dt><dd>{r.comment}</dd></>}
          <dt>Предварительно</dt><dd>{r.total_text}</dd>
        </dl>
        <div>{r.pets.map((p, i) => <div key={i} className="small" style={{ padding: '6px 0', borderTop: '1px solid var(--line)' }}>{petLine(p)} — {svcLine(p)}, <b>{priceText(p.res)}</b></div>)}</div>
        {!!r.photo_ids.length && <div className="thumbs">{r.photo_ids.map((id) => <a key={id} href={`/api/admin/photos/${id}`} target="_blank" rel="noopener"><img src={`/api/admin/photos/${id}`} alt="Фото питомца" /></a>)}</div>}
        <div className="grid2">
          <label className="field"><span>Статус</span><select className="input" value={st} onChange={(e) => setSt(e.target.value as Status)}>{(Object.keys(STATUS) as Status[]).map((k) => <option key={k} value={k}>{STATUS[k].label}</option>)}</select></label>
          <label className="field"><span>Итоговая цена</span><input className="input" maxLength={40} placeholder="например, 3 300 ₽" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
          <label className="field"><span>Время визита</span><input className="input" type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} /></label>
          <label className="field"><span>Заметка для салона</span><input className="input" maxLength={1000} placeholder="Клиент не увидит" value={note} onChange={(e) => setNote(e.target.value)} /></label>
        </div>
        <div className="cta" style={{ margin: 0 }}>
          <button type="button" className="btn btn-ink btn-sm" onClick={save}>Сохранить</button>
          <a className="btn btn-glass btn-sm" href={`/r/${r.token}`} target="_blank" rel="noopener">Страница клиента</a>
          <button type="button" className="btn btn-danger btn-sm" onClick={del}>Удалить</button>
        </div>
      </div>
    </details>
  );
}

export default function AdminApp({ name }: { name: string }) {
  const { toast, node } = useToast();
  const [tab, setTab] = useState<Tab>('req');
  const [items, setItems] = useState<Req[] | null>(null);
  const [fresh, setFresh] = useState(0);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [q, setQ] = useState('');
  const [ver, setVer] = useState(0);
  const [tg, setTg] = useState<Tg | null>(null);
  const [tariffs, setTariffs] = useState<Tariffs | null>(null);
  const [salon, setSalon] = useState<Settings | null>(null);
  const poll = useRef<number | undefined>(undefined);

  const loadReqs = useCallback(async () => {
    const { ok, data } = await api<{ items: Req[]; fresh: number }>(`/api/admin/requests?status=${filter}&q=${encodeURIComponent(q)}`);
    if (ok) { setItems(data.items); setFresh(data.fresh); }
  }, [filter, q]);
  useEffect(() => { const t = window.setTimeout(loadReqs, 250); return () => window.clearTimeout(t); }, [loadReqs, ver]);
  useEffect(() => { const id = window.setInterval(() => { if (!document.hidden) loadReqs(); }, 20000); return () => window.clearInterval(id); }, [loadReqs]);
  const loadTg = useCallback(async () => { const { ok, data } = await api<Tg>('/api/admin/telegram'); if (ok) setTg(data); return ok ? data : null; }, []);
  useEffect(() => {
    if (tab === 'tg') loadTg();
    if (tab === 'price' && !tariffs) api<Tariffs>('/api/admin/tariffs').then((r) => r.ok && setTariffs(r.data));
    if (tab === 'salon' && !salon) api<Settings>('/api/admin/settings').then((r) => r.ok && setSalon(r.data));
  }, [tab, tariffs, salon, loadTg]);
  useEffect(() => () => window.clearInterval(poll.current), []);

  const connectTg = async () => {
    const w = window.open('', '_blank'); // открываем сразу, иначе браузер заблокирует окно
    const { ok, data } = await api<{ url: string }>('/api/admin/telegram', 'POST');
    if (!ok) { w?.close(); toast(data.error ?? 'Не удалось'); return; }
    if (w) w.location.href = data.url; else window.location.href = data.url;
    setTg((t) => (t ? { ...t, waiting: true } : t));
    const started = Date.now();
    window.clearInterval(poll.current);
    poll.current = window.setInterval(async () => {
      const s = await loadTg();
      if (s?.linked) { window.clearInterval(poll.current); toast('Telegram подключён'); }
      if (Date.now() - started > 15 * 60000) window.clearInterval(poll.current);
    }, 3000);
  };
  const testTg = async () => { const { ok, data } = await api('/api/admin/telegram', 'PUT'); toast(ok ? 'Тестовое сообщение отправлено' : data.error ?? 'Не удалось'); };
  const unlinkTg = async () => { if (!window.confirm('Отключить уведомления в Telegram?')) return; await api('/api/admin/telegram', 'DELETE'); toast('Telegram отключён'); loadTg(); };
  const saveTariffs = async () => { const { ok, data } = await api('/api/admin/tariffs', 'PUT', tariffs); toast(ok ? 'Тарифы сохранены. Уже отправленные заявки сохраняют свою цену' : data.error ?? 'Не удалось'); };
  const saveSalon = async () => { const { ok, data } = await api('/api/admin/settings', 'PUT', salon); toast(ok ? 'Данные салона обновлены на сайте' : data.error ?? 'Не удалось'); };
  const changePass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form);
    if (f.get('next') !== f.get('next2')) { toast('Новые пароли не совпадают'); return; }
    const { ok, data } = await api('/api/admin/password', 'POST', { current: f.get('current'), next: f.get('next') });
    toast(ok ? 'Пароль изменён, другие входы завершены' : data.error ?? 'Не удалось'); if (ok) form.reset();
  };
  const logout = async () => { await api('/api/admin/logout', 'POST'); window.location.href = '/admin/login'; };

  const tabs: [Tab, string][] = [['req', 'Заявки'], ['tg', 'Telegram'], ['price', 'Тарифы'], ['salon', 'Салон'], ['access', 'Доступ']];
  return (
    <div className="admin">
      <aside className="side">
        <span className="logo"><i />{name}</span>
        {tabs.map(([k, l]) => <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}{k === 'req' && fresh > 0 && <span className="badge b-new">{fresh}</span>}</button>)}
        <button type="button" onClick={logout}>Выйти</button>
      </aside>
      <div className="main">
        {tab === 'req' && <>
          <h1 className="h2">Заявки</h1>
          <div className="chips group">{([['all', 'Все'], ...(Object.keys(STATUS) as Status[]).map((k) => [k, STATUS[k].label])] as [typeof filter, string][]).map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>)}</div>
          <input className="input group" placeholder="Поиск: имя, телефон, кличка, номер" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="group">
            {items === null ? <div className="empty">Загружаем…</div>
              : !items.length ? <div className="empty">{filter === 'all' && !q ? 'Заявок пока нет. Когда клиент отправит заявку с сайта, она появится здесь.' : 'Ничего не нашлось. Измените фильтр или поиск.'}</div>
              : items.map((r) => <ReqCard key={r.id + ':' + r.status + ':' + r.final_price} r={r} toast={toast} onChanged={() => setVer((v) => v + 1)} />)}
          </div>
        </>}
        {tab === 'tg' && <>
          <h1 className="h2">Telegram-уведомления</h1>
          <p className="muted">Каждая новая заявка придёт вам в Telegram: имя, телефон, филиал, пожелание по времени, питомцы, услуги, цена, комментарий и фото.</p>
          <div className="panel group">
            {!tg ? 'Загружаем…' : !tg.configured ? <><span className="badge b-ask">Бот не настроен</span><p className="muted">На сервере не заполнены TELEGRAM_BOT_TOKEN и TELEGRAM_BOT_USERNAME. Это делает тот, кто разворачивает сайт (см. README).</p></>
              : tg.linked ? <><span className="badge b-ok">Подключено</span><p className="muted">Уведомления приходят в чат с @{tg.bot}{tg.title ? ` (${tg.title})` : ''}{tg.linkedAt ? `, с ${fmtDate(tg.linkedAt)}` : ''}.</p>
                <div className="cta" style={{ marginTop: 8 }}><button type="button" className="btn btn-ink btn-sm" onClick={testTg}>Отправить тестовое</button><button type="button" className="btn btn-danger btn-sm" onClick={unlinkTg}>Отключить</button></div></>
              : <><span className={'badge' + (tg.waiting ? ' b-new' : '')}>{tg.waiting ? 'Ждём «Старт» в боте' : 'Не подключено'}</span>
                <p className="muted">Нажмите кнопку: откроется бот @{tg.bot}. В нём нажмите «Старт», и чат привяжется к кабинету. Ссылка действует 15 минут.</p>
                <button type="button" className="btn btn-tg" onClick={connectTg}>Подключить Telegram</button></>}
          </div>
        </>}
        {tab === 'price' && <>
          <h1 className="h2">Тарифы</h1><p className="muted">Меняют расчёт на сайте сразу. Уже отправленные заявки сохраняют свою цену.</p>
          {tariffs && <div className="panel group"><div className="grid2">{TARIFF_FIELDS.map(([k, l]) => <label className="field" key={k}><span>{l}</span><input className="input" type="number" min="0" step="any" value={tariffs[k]} onChange={(e) => setTariffs({ ...tariffs, [k]: parseFloat(e.target.value) })} /></label>)}</div>
            <button type="button" className="btn btn-ink group" onClick={saveTariffs}>Сохранить тарифы</button></div>}
        </>}
        {tab === 'salon' && <>
          <h1 className="h2">Салон</h1><p className="muted">Эти данные показываются на сайте.</p>
          {salon && <div className="panel group"><div className="grid2">
            <label className="field"><span>Название</span><input className="input" maxLength={40} value={salon.name} onChange={(e) => setSalon({ ...salon, name: e.target.value })} /></label>
            <label className="field"><span>Телефон</span><input className="input" type="tel" maxLength={20} value={salon.phone} onChange={(e) => setSalon({ ...salon, phone: e.target.value })} /></label>
            <label className="field"><span>Часы работы</span><input className="input" maxLength={80} value={salon.hours} onChange={(e) => setSalon({ ...salon, hours: e.target.value })} /></label>
            <label className="field"><span>Заголовок на главной</span><input className="input" maxLength={90} value={salon.heroTitle} onChange={(e) => setSalon({ ...salon, heroTitle: e.target.value })} /></label></div>
            <label className="field group"><span>Текст под заголовком</span><textarea className="input" maxLength={240} value={salon.heroText} onChange={(e) => setSalon({ ...salon, heroText: e.target.value })} /></label>
            <label className="field group"><span>Филиалы, по одному в строке</span><textarea className="input" value={salon.branches.join('\n')} onChange={(e) => setSalon({ ...salon, branches: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></label>
            <label className="check group"><input type="checkbox" checked={salon.catEnabled} onChange={(e) => setSalon({ ...salon, catEnabled: e.target.checked })} /><span>Показывать 3D-кошку</span></label>
            <label className="check group"><input type="checkbox" checked={salon.phrasesEnabled} onChange={(e) => setSalon({ ...salon, phrasesEnabled: e.target.checked })} /><span>Реплики питомца в облачке</span></label>
            <button type="button" className="btn btn-ink group" onClick={saveSalon}>Сохранить</button></div>}
        </>}
        {tab === 'access' && <>
          <h1 className="h2">Доступ</h1><p className="muted">В кабинет может войти только владелец. На сайте нет ссылки сюда.</p>
          <form className="panel group" onSubmit={changePass}><div className="grid2">
            <label className="field"><span>Текущий пароль</span><input className="input" name="current" type="password" autoComplete="current-password" required /></label><span />
            <label className="field"><span>Новый пароль</span><input className="input" name="next" type="password" autoComplete="new-password" minLength={10} required /></label>
            <label className="field"><span>Повторите</span><input className="input" name="next2" type="password" autoComplete="new-password" minLength={10} required /></label></div>
            <p className="muted small">Минимум 10 символов. После смены все другие входы завершатся.</p>
            <button type="submit" className="btn btn-ink">Сменить пароль</button></form>
        </>}
      </div>
      {node}
    </div>
  );
}
