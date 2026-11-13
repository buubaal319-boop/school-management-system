'use client';
import ResourcePage from '@/components/ResourcePage';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'code', label: 'Code' },
];
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
];

export default function SubjectsPage() {
  return <ResourcePage resource="subjects" title="Subjects" singular="Subject" fields={fields} columns={columns}
                       subtitle="The subjects taught across the school." />;
}
