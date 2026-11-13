const express = require('express');
const { db } = require('../config/firebase');
const { allow } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Numbers for the staff dashboard
router.get('/', allow('admin', 'teacher'), asyncHandler(async (req, res) => {
  const count = async (c) => (await db.collection(c).count().get()).data().count;
  const [students, teachers, classes, subjects, results] = await Promise.all(
    ['students', 'teachers', 'classes', 'subjects', 'results'].map(count)
  );

  // Today's attendance, grouped by class
  const today = new Date().toISOString().slice(0, 10);
  const attSnap = await db.collection('attendance').where('date', '==', today).get();
  const byClass = {};
  attSnap.docs.forEach((d) => {
    const a = d.data();
    const c = (byClass[a.classId] ||= { classId: a.classId, className: a.className, Present: 0, Absent: 0, Late: 0, Excused: 0 });
    c[a.status] = (c[a.status] || 0) + 1;
  });

  const recentSnap = await db.collection('results').orderBy('createdAt', 'desc').limit(6).get();
  const recentResults = recentSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  res.json({
    counts: { students, teachers, classes, subjects, results },
    today,
    attendanceToday: Object.values(byClass).sort((a, b) => String(a.className).localeCompare(String(b.className))),
    recentResults,
  });
}));

module.exports = router;
