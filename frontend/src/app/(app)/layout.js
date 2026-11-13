'use client';
// Wraps every signed-in page: redirects to /login if needed, blocks pages the
// role may not open, and shows the top navigation.
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n';
import { nav } from '@/config/nav';
import TopNav from '@/components/TopNav';

export default function AppLayout({ children }) {
  const { user, role, loading } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();

  const page = nav.find((n) => pathname.startsWith(n.href));
  const allowed = !page || page.roles.includes(role);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!allowed) router.replace('/dashboard');
  }, [loading, user, allowed, router]);

  if (loading || !user || !allowed) {
    return <div className="flex min-h-screen items-center justify-center text-ink-soft">{t('Loading')}</div>;
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}
