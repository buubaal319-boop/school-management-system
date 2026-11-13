'use client';
import ResourcePage from '@/components/ResourcePage';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'section', label: 'Section' },
  { name: 'academicYear', label: 'Academic year', default: String(new Date().getFullYear()) },
  { name: 'teacherId', label: 'Teacher', type: 'select', optionsFrom: { resource: 'teachers', labelKey: 'name' } },
];
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'section', label: 'Section' },
  { key: 'academicYear', label: 'Academic year' },
  { key: 'teacherName', label: 'Teacher' },
];

export default function ClassesPage() {
  return <ResourcePage resource="classes" title="Classes" singular="Class" fields={fields} columns={columns}
                       subtitle="Classrooms and their class teachers." />;
}
