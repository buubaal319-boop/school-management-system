'use client';
import ResourcePage from '@/components/ResourcePage';
import Pill from '@/components/Pill';

const isLearner = (f) => f.role === 'student' || f.role === 'parent';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true, createOnly: true },
  { name: 'password', label: 'Password', type: 'password', required: true, createOnly: true },
  { name: 'role', label: 'Role', type: 'select', required: true, options: [
    { value: 'admin', label: 'admin' }, { value: 'teacher', label: 'teacher' },
    { value: 'student', label: 'student' }, { value: 'parent', label: 'parent' },
  ] },
  // only for students and parents: which student's results/attendance they may see
  { name: 'linkedStudentId', label: 'Linked student', type: 'select', showIf: isLearner,
    optionsFrom: { resource: 'students', labelKey: 'fullName' } },
];
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (r, t) => <Pill value={r.role} label={t(r.role)} /> },
];

export default function UsersPage() {
  return <ResourcePage resource="users" title="Users" singular="User" fields={fields} columns={columns}
                       initForm={(r) => ({ ...r, linkedStudentId: r.linkedStudentIds?.[0] || '' })}
                       subtitle="Login accounts. The role decides what each person can see and change." />;
}
