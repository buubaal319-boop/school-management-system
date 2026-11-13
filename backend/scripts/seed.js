// Optional: fills the database with sample data so you can try the app.
//   npm run seed
const { db } = require('../src/config/firebase');
const { gradeFor } = require('../src/utils/grade');

const now = () => new Date().toISOString();

(async () => {
  const subjects = ['Mathematics', 'English', 'Science', 'Islamic Studies', 'Somali'];
  const subjectRefs = [];
  for (const [i, name] of subjects.entries()) {
    const ref = await db.collection('subjects').add({ name, code: `SUB${i + 1}`, createdAt: now(), updatedAt: now() });
    subjectRefs.push({ id: ref.id, name });
  }

  const teachers = [];
  for (const [i, name] of ['Amina Hassan', 'Yusuf Warsame', 'Hodan Ali'].entries()) {
    const s = subjectRefs[i];
    const ref = await db.collection('teachers').add({
      name, email: '', phone: '', subjectId: s.id, subjectName: s.name, createdAt: now(), updatedAt: now(),
    });
    teachers.push({ id: ref.id, name });
  }

  const classes = [];
  for (const [i, name] of ['Grade 1', 'Grade 2', 'Grade 3'].entries()) {
    const t = teachers[i];
    const ref = await db.collection('classes').add({
      name, section: 'A', academicYear: '2026', teacherId: t.id, teacherName: t.name, createdAt: now(), updatedAt: now(),
    });
    classes.push({ id: ref.id, name });
  }

  const names = ['Ayaan Abdi', 'Hibo Mohamed', 'Ismail Farah', 'Sagal Nur', 'Abdirahman Jama', 'Fadumo Osman'];
  for (const [i, fullName] of names.entries()) {
    const c = classes[i % classes.length];
    const st = await db.collection('students').add({
      fullName, admissionNo: `ADM-${1000 + i}`, gender: i % 2 ? 'Female' : 'Male',
      classId: c.id, className: c.name, guardianName: '', guardianPhone: '', status: 'Active',
      createdAt: now(), updatedAt: now(),
    });
    const s = subjectRefs[i % subjectRefs.length];
    const score = 55 + ((i * 13) % 45);
    await db.collection('results').add({
      studentId: st.id, studentName: fullName, subjectId: s.id, subjectName: s.name,
      score, grade: gradeFor(score), examType: 'Midterm', term: 'Term 1', year: 2026,
      createdAt: now(), updatedAt: now(),
    });
  }
  console.log('Sample data added.');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
