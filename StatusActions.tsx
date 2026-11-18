'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './useToast';

export default function StatusActions({ token, canCancel }: { token: string; canCancel: boolean }) {
  const router = useRouter();
  const { toast, node } = useToast();
  const [busy, setBusy] = useState(false);
  // Статус обновляется сам, пока страница открыта.
  useEffect(() => { const id = window.setInterval(() => { if (!document.hidden) router.refresh(); }, 30000); return () => window.clearInterval(id); }, [router]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast('Ссылка скопирована'); }
    catch { window.prompt('Скопируйте ссылку', window.location.href); }
  };
  const cancel = async () => {
    if (!window.confirm('Отменить заявку? Салон увидит отмену.')) return;
    setBusy(true);
    const r = await fetch(`/api/requests/${encodeURIComponent(token)}/cancel`, { method: 'POST' }).catch(() => null);
    setBusy(false);
    if (r?.ok) { toast('Заявка отменена'); router.refresh(); } else toast('Не получилось отменить. Позвоните в салон.');
  };
  return (
    <>
      <div className="group panel" style={{ background: 'var(--mist)', boxShadow: 'none', padding: 18 }}>
        <b>Это ваша личная ссылка</b>
        <p className="muted small" style={{ margin: '6px 0 12px' }}>Сохраните её. По номеру телефона заявку найти нельзя, так ваши данные не увидят чужие.</p>
        <button type="button" className="btn btn-ink btn-sm" onClick={copy}>Скопировать ссылку</button>
      </div>
      {canCancel && <div className="group"><button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={cancel}>Отменить заявку</button></div>}
      {node}
    </>
  );
}
