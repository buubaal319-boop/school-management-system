// =====================================================================
//  THE MAP OF YOUR DATA.  One entry = one Firestore collection + API.
//
//  fields   : the ONLY fields the API will save (anything else is ignored)
//  required : fields that must be filled in
//  read     : roles that may list/read      write : roles that may create/edit/delete
//  filters  : query-string filters allowed, e.g. GET /api/students?classId=abc
//  refs     : when `classId` is saved, also store the class name as `className`
//             (so lists show names without extra lookups)
//  scoped   : students/parents only see rows whose studentId is linked to them
//  sortBy   : default sort field
//
//  To add a new module (e.g. "fees"): add an entry here, then add a page in
//  the frontend. No new route or controller code is needed. See NOTE.md.
// =====================================================================
const { gradeFor } = require('../utils/grade');

const STAFF = ['admin', 'teacher'];
const ALL = ['admin', 'teacher', 'student', 'parent'];

module.exports = {
  students: {
    fields: ['fullName', 'admissionNo', 'gender', 'classId', 'guardianName', 'guardianPhone', 'status'],
    required: ['fullName', 'classId'],
    read: STAFF, write: ['admin'],
    filters: ['classId', 'status'],
    refs: [{ idField: 'classId', collection: 'classes', nameField: 'className', from: 'name' }],
    sortBy: 'fullName',
  },
  teachers: {
    fields: ['name', 'email', 'phone', 'subjectId'],
    required: ['name'],
    read: STAFF, write: ['admin'],
    filters: [],
    refs: [{ idField: 'subjectId', collection: 'subjects', nameField: 'subjectName', from: 'name' }],
    sortBy: 'name',
  },
  classes: {
    fields: ['name', 'section', 'academicYear', 'teacherId'],
    required: ['name'],
    read: STAFF, write: ['admin'],
    filters: [],
    refs: [{ idField: 'teacherId', collection: 'teachers', nameField: 'teacherName', from: 'name' }],
    sortBy: 'name',
  },
  subjects: {
    fields: ['name', 'code'],
    required: ['name'],
    read: STAFF, write: ['admin'],
    filters: [],
    refs: [],
    sortBy: 'name',
  },
  results: {
    fields: ['studentId', 'subjectId', 'score', 'examType', 'term', 'year'],
    required: ['studentId', 'subjectId', 'score'],
    read: ALL, write: STAFF,
    filters: ['studentId', 'subjectId', 'term', 'year'],
    refs: [
      { idField: 'studentId', collection: 'students', nameField: 'studentName', from: 'fullName' },
      { idField: 'subjectId', collection: 'subjects', nameField: 'subjectName', from: 'name' },
    ],
    // runs before saving: turns the score into a number and adds a letter grade
    transform: (data) => {
      if (data.score !== undefined) {
        data.score = Number(data.score);
        data.grade = gradeFor(data.score);
      }
      if (data.year !== undefined && data.year !== '') data.year = Number(data.year);
      return data;
    },
    scoped: true,
    sortBy: 'createdAt', sortDesc: true,
  },
  // Attendance is READ through the generic API; it is WRITTEN by the bulk
  // endpoint in routes/attendance.js (one call saves a whole class).
  attendance: {
    fields: [],
    required: [],
    read: ALL, write: [],
    filters: ['classId', 'date', 'studentId'],
    refs: [],
    scoped: true,
    sortBy: 'studentName',
  },
};
