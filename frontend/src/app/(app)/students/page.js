'use client';
import ResourcePage from '@/components/ResourcePage';
import Pill from '@/components/Pill';

// TO ADD A FIELD: add a line in `fields`, a line in `columns`, and the field name
// in backend/src/config/resources.js (students.fields). That's all.
const fields = [
  { name: 'fullName', label: 'Full name', required: true },
  { name: 'admissionNo', label: 'Admission no.' },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
  { name: 'classId', label: 'Class', type: 'select', required: true, optionsFrom: { resource: 'classes', labelKey: 'name' } },
  { name: 'guardianName', label: 'Guardian' },
  { name: 'guardianPhone', label: 'Guardian phone', type: 'tel' },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Graduated'], default: 'Active' },
];

const columns = [
  { key: 'fullName', label: 'Full name' },
  { key: 'admissionNo', label: 'Admission no.' },
  { key: 'className', label: 'Class' },
  { key: 'guardianName', label: 'Guardian' },
  { key: 'status', label: 'Status', render: (r, t) => <Pill value={r.status} label={t(r.status)} /> },
];

export default function StudentsPage() {
  return <ResourcePage resource="students" title="Students" singular="Student" fields={fields} columns={columns}
                       subtitle="Everyone enrolled at the school, grouped by class." />;
}
