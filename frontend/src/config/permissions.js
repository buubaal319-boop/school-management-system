// Mirrors the backend rules (backend/src/config/resources.js) so the UI can hide
// buttons. The BACKEND is what really enforces permissions.
export const WRITE = {
  students: ['admin'],
  teachers: ['admin'],
  classes: ['admin'],
  subjects: ['admin'],
  results: ['admin', 'teacher'],
  users: ['admin'],
};
export const canWrite = (role, resource) => (WRITE[resource] || []).includes(role);
export const isStaff = (role) => role === 'admin' || role === 'teacher';
