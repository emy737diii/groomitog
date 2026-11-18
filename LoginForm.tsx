'use client';
import { useState } from 'react';

export default function LoginForm({ name }: { name: string }) {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true); setErr('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: fd.get('login'), password: fd.get('password') }) }).catch(() => null);
    if (r?.ok) { window.location.href = '/admin'; return; }
    const data = await r?.json().catch(() => ({}));
    setErr(data?.error ?? 'Нет связи с сервером');
    setBusy(false);
    const pw = form.querySelector<HTMLInputElement>('input[name=password]'); if (pw) pw.value = '';
  }
  return (
    <div className="login"><form className="panel" onSubmit={onSubmit}>
      <span className="logo"><i />{name}</span>
      <h1 className="h2 group" style={{ fontSize: '2rem' }}>Вход для владельца</h1>
      <label className="field group"><span>Логин</span><input className="input" name="login" autoComplete="username" required /></label>
      <label className="field group"><span>Пароль</span><input className="input" name="password" type="password" autoComplete="current-password" required /></label>
      <p className="small" style={{ color: '#A8322B', minHeight: '1.4em', margin: '10px 0 0' }} role="alert">{err}</p>
      <button className="btn btn-ink" type="submit" disabled={busy} style={{ width: '100%', marginTop: 6 }}>{busy ? 'Входим…' : 'Войти'}</button>
    </form></div>
  );
}
