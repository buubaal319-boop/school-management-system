'use client';
// ONE reusable "list + add/edit/delete" page. Students, Teachers, Classes, Subjects,
// Results and Users are all just this component with different `fields` and `columns`.
//
// fields  : [{ name, label, type, required, options | optionsFrom, createOnly, default, showIf }]
// columns : [{ key, label, render?(row) }]
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Printer } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n';
import { canWrite } from '@/config/permissions';
import PageHeader from './PageHeader';
import Modal from './Modal';

const asOption = (o) => (typeof o === 'string' ? { value: o, label: o } : o);

export default function ResourcePage({ resource, title, subtitle, singular, fields, columns, initForm, printable }) {
  const { role } = useAuth();
  const { t } = useT();
  const writable = canWrite(role, resource);

  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({}); // options loaded from other collections
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, row = editing
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      setRows(await api(`/${resource}`));
      setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [resource]);

  useEffect(() => { load(); }, [load]);

  // load dropdown options (e.g. the list of classes for the "Class" field)
  useEffect(() => {
    if (!writable) return;
    fields.filter((f) => f.optionsFrom).forEach(async (f) => {
      try {
        const list = await api(`/${f.optionsFrom.resource}`);
        setLookups((p) => ({ ...p, [f.name]: list.map((r) => ({ value: r.id, label: r[f.optionsFrom.labelKey] })) }));
      } catch { /* leave empty */ }
    });
  }, [writable]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q)));
  }, [rows, query, columns]);

  const openNew = () => {
    const blank = {};
    fields.forEach((f) => { blank[f.name] = f.default ?? ''; });
    setForm(blank); setFormError(''); setEditing({});
  };
  const openEdit = (row) => {
    const base = initForm ? initForm(row) : row;
    const next = {};
    fields.forEach((f) => { next[f.name] = base[f.name] ?? ''; });
    setForm(next); setFormError(''); setEditing(row);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    const isNew = !editing.id;
    // send only the fields that are visible for this action
    const body = {};
    fields.forEach((f) => {
      if (f.createOnly && !isNew) return;
      if (f.showIf && !f.showIf(form)) return;
      body[f.name] = form[f.name];
    });
    try {
      await api(isNew ? `/${resource}` : `/${resource}/${editing.id}`, { method: isNew ? 'POST' : 'PUT', body });
      setEditing(null);
      await load();
    } catch (err) { setFormError(err.message); }
    setSaving(false);
  };

  const remove = async (row) => {
    if (!window.confirm(t('Delete this record?'))) return;
    try { await api(`/${resource}/${row.id}`, { method: 'DELETE' }); await load(); }
    catch (err) { setError(err.message); }
  };

  const visibleFields = fields.filter((f) => (!f.createOnly || !editing?.id) && (!f.showIf || f.showIf(form)));

  return (
    <>
      <PageHeader title={t(title)} subtitle={subtitle}>
        {printable && <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} />{t('Print')}</button>}
        {writable && <button className="btn-primary" onClick={openNew}><Plus size={16} />{t('Add')} {t(singular)}</button>}
      </PageHeader>

      <div className="card">
        <div className="no-print border-b border-rule p-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input className="input pl-9" placeholder={t('Search')} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {error && <p className="m-4 rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key} className="th">{t(c.label)}</th>)}
                {writable && <th className="th no-print w-24" />}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="td text-ink-soft" colSpan={columns.length + 1}>{t('Loading')}</td></tr>}
              {!loading && !filtered.length && (
                <tr><td className="td py-10 text-center text-ink-soft" colSpan={columns.length + 1}>{t('Nothing here yet.')}</td></tr>
              )}
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-brand-50/40">
                  {columns.map((c) => <td key={c.key} className="td">{c.render ? c.render(row, t) : row[c.key] ?? '—'}</td>)}
                  {writable && (
                    <td className="td no-print">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(row)} aria-label={t('Edit')} className="rounded p-1.5 text-ink-soft hover:bg-brand-50 hover:text-brand-700"><Pencil size={15} /></button>
                        <button onClick={() => remove(row)} aria-label={t('Delete')} className="rounded p-1.5 text-ink-soft hover:bg-clay-50 hover:text-clay-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={`${editing.id ? t('Edit') : t('Add')} ${t(singular)}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            {visibleFields.map((f) => {
              const options = (f.options ? f.options : lookups[f.name] || []).map(asOption);
              return (
                <div key={f.name}>
                  <label className="label" htmlFor={f.name}>{t(f.label)}{f.required && <span className="text-clay-500"> *</span>}</label>
                  {f.type === 'select' ? (
                    <select id={f.name} className="input" required={f.required} value={form[f.name]}
                            onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                      <option value="">—</option>
                      {options.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
                    </select>
                  ) : (
                    <input id={f.name} className="input" type={f.type || 'text'} required={f.required}
                           min={f.min} max={f.max} autoComplete={f.type === 'password' ? 'new-password' : 'off'}
                           value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  )}
                </div>
              );
            })}
            {formError && <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-600">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>{t('Cancel')}</button>
              <button type="submit" className="btn-primary" disabled={saving}>{t('Save')}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
