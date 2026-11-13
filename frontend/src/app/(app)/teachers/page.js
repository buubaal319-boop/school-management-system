'use client';
import ResourcePage from '@/components/ResourcePage';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'subjectId', label: 'Subject', type: 'select', optionsFrom: { resource: 'subjects', labelKey: 'name' } },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
];
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'subjectName', label: 'Subject' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
];

export default function TeachersPage() {
  return <ResourcePage resource="teachers" title="Teachers" singular="Teacher" fields={fields} columns={columns}
                       subtitle="The teaching staff and the subject each one leads." />;
}
