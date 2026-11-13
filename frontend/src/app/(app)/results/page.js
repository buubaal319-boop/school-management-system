'use client';
import ResourcePage from '@/components/ResourcePage';
import Pill from '@/components/Pill';

// The letter grade is worked out automatically by the backend (backend/src/utils/grade.js).
const fields = [
  { name: 'studentId', label: 'Student', type: 'select', required: true, optionsFrom: { resource: 'students', labelKey: 'fullName' } },
  { name: 'subjectId', label: 'Subject', type: 'select', required: true, optionsFrom: { resource: 'subjects', labelKey: 'name' } },
  { name: 'score', label: 'Score', type: 'number', required: true, min: 0, max: 100 },
  { name: 'examType', label: 'Exam type', type: 'select', options: ['Midterm', 'Final', 'Quiz', 'Assignment'], default: 'Midterm' },
  { name: 'term', label: 'Term', type: 'select', options: ['Term 1', 'Term 2', 'Term 3'], default: 'Term 1' },
  { name: 'year', label: 'Year', type: 'number', default: new Date().getFullYear() },
];
const columns = [
  { key: 'studentName', label: 'Student' },
  { key: 'subjectName', label: 'Subject' },
  { key: 'score', label: 'Score' },
  { key: 'grade', label: 'Grade', render: (r) => <Pill value={r.grade} /> },
  { key: 'examType', label: 'Exam type', render: (r, t) => t(r.examType || '') || '—' },
  { key: 'term', label: 'Term', render: (r, t) => t(r.term || '') || '—' },
  { key: 'year', label: 'Year' },
];

export default function ResultsPage() {
  return <ResourcePage resource="results" title="Results" singular="Result" fields={fields} columns={columns} printable
                       subtitle="Exam scores and grades. Use Print for a clean report sheet." />;
}
