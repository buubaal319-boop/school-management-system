'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut, Menu, X } from 'lucide-react';
import { nav } from '@/config/nav';
import { school } from '@/config/school';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n';

export default function TopNav() {
  const pathname = usePathname();
  const { profile, role, logout } = useAuth();
  const { t, lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const items = nav.filter((n) => n.roles.includes(role));

  return (
    <header className="no-print border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Crest + school name */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-gold-400 ring-2 ring-gold-500 ring-offset-2 ring-offset-paper">
            <GraduationCap size={20} />
          </span>
          <span className="font-serif text-xl font-semibold leading-none text-brand-800">{school.name}</span>
        </Link>

        {/* Links (desktop) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {items.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                    className={`border-b-2 px-3 py-1.5 text-sm transition-colors ${active ? 'border-gold-500 font-semibold text-brand-800' : 'border-transparent text-ink-soft hover:text-brand-700'}`}>
                {t(label)}
              </Link>
            );
          })}
        </nav>

        {/* Language + user */}
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-md border border-rule text-xs">
            {['en', 'so'].map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                      className={`px-2 py-1 ${lang === l ? 'bg-brand-700 text-white' : 'bg-white text-ink-soft hover:bg-brand-50'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-medium">{profile?.name}</p>
            <p className="text-xs text-ink-soft">{t(role || '')}</p>
          </div>
          <button onClick={logout} title={t('Sign out')} aria-label={t('Sign out')}
                  className="rounded-md border border-rule bg-white p-2 text-ink-soft hover:bg-brand-50"><LogOut size={16} /></button>
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="rounded-md border border-rule bg-white p-2 lg:hidden">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Links (mobile) */}
      {open && (
        <nav className="border-t border-rule bg-white px-4 py-2 lg:hidden">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm ${pathname.startsWith(href) ? 'bg-brand-50 font-semibold text-brand-800' : 'text-ink-soft'}`}>
              <Icon size={16} /> {t(label)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
