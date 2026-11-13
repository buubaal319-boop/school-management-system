'use client';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n';
import { isStaff } from '@/config/permissions';
import PageHeader from '@/components/PageHeader';
import Pill from '@/components/Pill';

const STATUSES = ['Present', 'Absent', 'Late', 'Excused'];
const activeStyle = {
  Present: 'bg-brand-700 text-white border-brand-700',
  Absent: 'bg-clay-500 text-white border-clay-500',
  Late: 'bg-gold-500 text-white border-gold-500',
  Excused: 'bg-ink-soft text-white border-ink-soft',
};
const today = () => new Date().toISOString().slice(0, 10);

// ---- Teachers & admins: take the register for a class ----
function TakeAttendance() {
  const { t } = useT();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(today());
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { studentId: status }
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { api('/classes').then(setClasses).catch(() => {}); }, []);

  // when the class or date changes: load the students + anything already saved
  useEffect(() => {
    if (!classId) { setStudents([]); return; }
    setMessage({ type: '', text: '' });
    Promise.all([api(`/students?classId=${classId}`), api(`/attendance?classId=${classId}&date=${date}`)])
      .then(([list, saved]) => {
        const savedMap = Object.fromEntries(saved.map((a) => [a.studentId, a.status]));
        setStudents(list);
        setMarks(Object.fromEntries(list.map((s) => [s.id, savedMap[s.id] || 'Present'])));
      })
      .catch((e) => setMessage({ type: 'error', text: e.message }));
  }, [classId, date]);

  const save = async () => {
    setSaving(true); setMessage({ type: '', text: '' });
    try {
      const records = students.map((s) => ({ studentId: s.id, status: marks[s.id] }));
      await api('/attendance/bulk', { method: 'POST', body: { date, classId, records } });
      setMessage({ type: 'ok', text: `${t('Save attendance')} ✓` });
    } catch (e) { setMessage({ type: 'error', text: e.message }); }
    setSaving(false);
  };

  const counts = STATUSES.map((s) => [s, students.filter((st) => marks[st.id] === s).length]);

  return (
    <>
      <PageHeader title={t('Attendance')} subtitle="Choose a class and a day, mark each student, then save the register." />
      <div className="card">
        <div className="flex flex-wrap items-end gap-4 border-b border-rule p-4">
          <div className="min-w-[12rem]">
            <label className="label" htmlFor="class">{t('Class')}</label>
            <select id="class" className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">{t('Choose a class')}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.section ? ` ${c.section}` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="date">{t('Date')}</label>
            <input id="date" type="date" className="input" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
          </div>
          {students.length > 0 && (
            <button className="btn-ghost ml-auto" onClick={() => setMarks(Object.fromEntries(students.map((s) => [s.id, 'Present'])))}>
              <Check size={16} /> {t('Mark all present')}
            </button>
          )}
        </div>

        {students.length > 0 && (
          <>
            <ul>
              {students.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-rule/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{s.fullName}</p>
                    <p className="text-xs text-ink-soft">{s.admissionNo}</p>
                  </div>
                  <div className="flex overflow-hidden rounded-md border border-rule" role="group" aria-label={s.fullName}>
                    {STATUSES.map((st) => (
                      <button key={st} onClick={() => setMarks({ ...marks, [s.id]: st })} aria-pressed={marks[s.id] === st}
                              className={`border-r border-rule px-3 py-1.5 text-xs last:border-r-0 ${marks[s.id] === st ? activeStyle[st] : 'bg-white text-ink-soft hover:bg-brand-50'}`}>
                        {t(st)}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-ink-soft">{counts.map(([s, n]) => `${t(s)}: ${n}`).join('   ')}</p>
              <div className="flex items-center gap-3">
                {message.text && <span className={`text-sm ${message.type === 'error' ? 'text-clay-600' : 'text-brand-700'}`}>{message.text}</span>}
                <button className="btn-primary" onClick={save} disabled={saving}>{t('Save attendance')}</button>
              </div>
            </div>
          </>
        )}
        {classId && !students.length && !message.text && <p className="p-8 text-center text-sm text-ink-soft">{t('Nothing here yet.')}</p>}
      </div>
    </>
  );
}

// ---- Students & parents: see their own record ----
function MyAttendance() {
  const { t } = useT();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api('/attendance').then((r) => setRows(r.sort((a, b) => b.date.localeCompare(a.date)))).catch(() => {});
  }, []);
  return (
    <>
      <PageHeader title={t('My attendance')} />
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className="th">{t('Date')}</th><th className="th">{t('Student')}</th><th className="th">{t('Class')}</th><th className="th">{t('Status')}</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}><td className="td">{r.date}</td><td className="td">{r.studentName}</td><td className="td">{r.className}</td><td className="td"><Pill value={r.status} label={t(r.status)} /></td></tr>
            ))}
            {!rows.length && <tr><td className="td text-ink-soft" colSpan={4}>{t('Nothing here yet.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AttendancePage() {
  const { role } = useAuth();
  return isStaff(role) ? <TakeAttendance /> : <MyAttendance />;
}
