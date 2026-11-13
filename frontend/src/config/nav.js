// The top navigation. Add a page: add a line here + create src/app/(app)/<name>/page.js
import { LayoutDashboard, GraduationCap, Users, School, BookOpen, CalendarCheck, FileText, KeyRound } from 'lucide-react';

const ALL = ['admin', 'teacher', 'student', 'parent'];
const STAFF = ['admin', 'teacher'];

export const nav = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard, roles: ALL },
  { href: '/students',   label: 'Students',   icon: GraduationCap,   roles: STAFF },
  { href: '/teachers',   label: 'Teachers',   icon: Users,           roles: STAFF },
  { href: '/classes',    label: 'Classes',    icon: School,          roles: STAFF },
  { href: '/subjects',   label: 'Subjects',   icon: BookOpen,        roles: STAFF },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck,   roles: ALL },
  { href: '/results',    label: 'Results',    icon: FileText,        roles: ALL },
  { href: '/users',      label: 'Users',      icon: KeyRound,        roles: ['admin'] },
];
