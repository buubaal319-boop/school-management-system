'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n';
import { school } from '@/config/school';

const friendly = (code) =>
  ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code)
    ? 'Wrong email or password.'
    : code === 'auth/too-many-requests' ? 'Too many attempts. Try again in a few minutes.' : 'Could not sign in.';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, authError, loading } = useAuth();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) router.replace('/dashboard'); }, [user, router]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(email, password); }
    catch (err) { setError(friendly(err.code)); }
    setBusy(false);
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left: the school */}
      <section className="flex flex-col justify-between bg-brand-800 p-8 text-white sm:p-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-gold-400 ring-2 ring-gold-500 ring-offset-2 ring-offset-brand-800">
          <GraduationCap size={24} />
        </span>
        <div className="py-16">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{school.fullName}</h1>
          <div className="mt-5 h-0.5 w-14 bg-gold-500" />
          <p className="mt-5 max-w-sm font-serif text-xl text-brand-100">{school.tagline}</p>
        </div>
        <p className="text-sm text-brand-200">School Management System</p>
      </section>

      {/* Right: the form */}
o      <section className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <h2 className="text-3xl font-semibold text-brand-800">{t('Sign in')}</h2>
          <div>
            <label className="label" htmlFor="email">{t('Email')}</label>
            <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="password">{t('Password')}</label>
            <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {(error || authError) && <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-600">{error || authError}</p>}
          <button className="btn-primary w-full" disabled={busy || loading}>{t('Sign in')}</button>
        </form>
      </section>
    </main>
  );
}
