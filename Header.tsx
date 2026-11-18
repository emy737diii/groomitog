'use client';
import { useEffect, useState } from 'react';

export default function Header({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={'top' + (scrolled ? ' scrolled' : '')}><div className="wrap">
      <a className="logo" href="#"><i />{name}</a>
      <nav className="nav"><a href="#services">Услуги</a><a href="#calc">Расчёт</a><a href="#how">Как записаться</a><a href="#contacts">Контакты</a></nav>
      <a className="btn btn-ink btn-sm" href="#calc">Записаться</a>
    </div></header>
  );
}
