// Saves attendance for a whole class in ONE request.
// Body: { date: "2026-11-12", classId: "abc", records: [{ studentId, status }] }
// Each record is stored under the id  <date>_<studentId>  so saving twice
// for the same day simply overwrites (no duplicates).
const express = require('express');
const { db } = require('../config/firebase');
const { allow } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const STATUSES = ['Present', 'Absent', 'Late', 'Excused'];

router.post('/bulk', allow('admin', 'teacher'), asyncHandler(async (req, res) => {
  const { date, classId, records } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ message: 'A valid date is required.' });
  if (!classId || !Array.isArray(records)) return res.status(400).json({ message: 'classId and records are required.' });

  const classSnap = await db.collection('classes').doc(classId).get();
  if (!classSnap.exists) return res.status(400).json({ message: 'Class not found.' });

  const studentSnaps = await db.collection('students').where('classId', '==', classId).get();
  const students = new Map(studentSnaps.docs.map((d) => [d.id, d.data()]));

  const batch = db.batch();
  let saved = 0;
  for (const r of records) {
    const student = students.get(r.studentId);
    if (!student || !STATUSES.includes(r.status)) continue; // skip invalid rows
    batch.set(db.collection('attendance').doc(`${date}_${r.studentId}`), {
      studentId: r.studentId,
      studentName: student.fullName,
      classId,
      className: classSnap.data().name,
      date,
      status: r.status,
      markedBy: req.user.uid,
      updatedAt: new Date().toISOString(),
    });
    saved++;
  }
  await batch.commit();
  res.json({ message: 'Attendance saved', saved });
}));

module.exports = router;
