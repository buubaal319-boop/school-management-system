'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, FileText, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n';
import { isStaff } from '@/config/permissions';
import { school } from '@/config/school';
import Pill from '@/components/Pill';

function greetingKey() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// The welcome banner: the one bold element on the page.
function Banner({ name }) {
  const { t, lang } = useT();
  const date = new Date().toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <section className="rounded-md bg-brand-800 px-6 py-8 text-white sm:px-10 sm:py-10">
      <p className="text-sm text-brand-200">{date}</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{t(greetingKey())}, {name?.split(' ')[0]}</h1>
      <div className="mt-4 h-0.5 w-12 bg-gold-500" />
      <p className="mt-4 font-serif text-lg text-brand-100">{school.tagline}</p>
    </section>
  );
}

function StaffDashboard({ profile }) {
  const { t } = useT();
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api('/dashboard').then(setData).catch((e) => setError(e.message)); }, []);

  const stats = data && [
    ['Students', data.counts.students], ['Teachers', data.counts.teachers], ['Classes', data.counts.classes],
    ['Subjects', data.counts.subjects], ['Results', data.counts.results],
  ];

  const actions = [
    { href: '/attendance', label: 'Take attendance', icon: CalendarCheck },
    { href: '/results', label: 'Enter results', icon: FileText },
    ...(role === 'admin' ? [{ href: '/students', label: 'Add a student', icon: UserPlus }] : []),
  ];

  return (
    <div className="space-y-8">
      <Banner name={profile.name} />
      {error && <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-600">{error}</p>}

      {/* Quiet figures */}
      <section className="card grid grid-cols-2 divide-rule sm:grid-cols-5 sm:divide-x">
        {(stats || Array.from({ length: 5 }, (_, i) => ['…', '–'])).map(([label, n]) => (
          <div key={label} className="px-6 py-5">
            <p className="font-serif text-4xl font-semibold text-brand-800">{n}</p>
            <p className="mt-1 text-sm text-ink-soft">{t(label)}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Attendance today */}
          <section className="card p-6">
            <h2 className="mb-4 text-xl font-semibold text-brand-800">{t('Attendance today')}</h2>
            {!data?.attendanceToday.length && <p className="text-sm text-ink-soft">{t('Nothing here yet.')}</p>}
            <ul className="space-y-4">
              {data?.attendanceToday.map((c) => {
                const total = c.Present + c.Absent + c.Late + c.Excused || 1;
                return (
                  <li key={c.classId}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{c.className}</span>
                      <span className="text-ink-soft">{c.Present + c.Late}/{total} {t('Present').toLowerCase()}</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-ink/5">
                      <div className="bg-brand-600" style={{ width: `${(c.Present / total) * 100}%` }} />
                      <div className="bg-gold-500" style={{ width: `${(c.Late / total) * 100}%` }} />
                      <div className="bg-clay-500" style={{ width: `${(c.Absent / total) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Recent results */}
          <section className="card">
            <h2 className="p-6 pb-3 text-xl font-semibold text-brand-800">{t('Recent results')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {data?.recentResults.map((r) => (
                    <tr key={r.id}>
                      <td className="td font-medium">{r.studentName}</td>
                      <td className="td text-ink-soft">{r.subjectName}</td>
                      <td className="td">{r.score}</td>
                      <td className="td"><Pill value={r.grade} /></td>
                    </tr>
                  ))}
                  {data && !data.recentResults.length && <tr><td className="td text-ink-soft">{t('Nothing here yet.')}</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Quick actions */}
        <aside>
          <section className="card p-6">
            <h2 className="mb-2 text-xl font-semibold text-brand-800">{t('Quick actions')}</h2>
            <ul className="divide-y divide-rule">
              {actions.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 py-3 text-sm text-ink hover:text-brand-700">
                    <Icon size={16} className="text-gold-600" /> {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

// Students and parents: their own results and attendance only (the backend filters them).
function LearnerDashboard({ profile }) {
  const { t } = useT();
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    api('/results').then(setResults).catch(() => {});
    api('/attendance').then(setAttendance).catch(() => {});
  }, []);

  const counts = attendance.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});

  return (
    <div className="space-y-8">
      <Banner name={profile.name} />
      <section className="card grid grid-cols-2 divide-rule sm:grid-cols-4 sm:divide-x">
        {['Present', 'Absent', 'Late', 'Excused'].map((s) => (
          <div key={s} className="px-6 py-5">
            <p className="font-serif text-4xl font-semibold text-brand-800">{counts[s] || 0}</p>
            <p className="mt-1 text-sm text-ink-soft">{t(s)}</p>
          </div>
        ))}
      </section>
      <section className="card">
        <h2 className="p-6 pb-3 text-xl font-semibold text-brand-800">{t('My results')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="td font-medium">{r.subjectName}</td>
                  <td className="td text-ink-soft">{t(r.examType || '')} · {t(r.term || '')} {r.year}</td>
                  <td className="td">{r.score}</td>
                  <td className="td"><Pill value={r.grade} /></td>
                </tr>
              ))}
              {!results.length && <tr><td className="td text-ink-soft">{t('Nothing here yet.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, role } = useAuth();
  return isStaff(role) ? <StaffDashboard profile={profile} /> : <LearnerDashboard profile={profile} />;
}
