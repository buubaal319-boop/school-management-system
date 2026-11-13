// Admin-only: manage login accounts (Firebase Auth) + their role (Firestore `users`).
const express = require('express');
const { db, auth } = require('../config/firebase');
const { allow } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const ROLES = ['admin', 'teacher', 'student', 'parent'];

const bad = (res, message) => res.status(400).json({ message });

router.use(allow('admin'));

router.get('/', asyncHandler(async (req, res) => {
  const snap = await db.collection('users').get();
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, password, role, linkedStudentId } = req.body;
  if (!name || !email || !password) return bad(res, 'Name, email and password are required.');
  if (!ROLES.includes(role)) return bad(res, 'Invalid role.');
  if (String(password).length < 6) return bad(res, 'Password must be at least 6 characters.');

  const user = await auth.createUser({ email, password, displayName: name });
  const profile = { name, email, role, linkedStudentIds: linkedStudentId ? [linkedStudentId] : [], createdAt: new Date().toISOString() };
  await db.collection('users').doc(user.uid).set(profile);
  res.status(201).json({ id: user.uid, ...profile });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { name, role, disabled, linkedStudentId } = req.body;
  const data = {};
  // a student/parent account is linked to one student (add more ids in Firestore if a parent has several children)
  if (linkedStudentId !== undefined) data.linkedStudentIds = linkedStudentId ? [linkedStudentId] : [];
  if (name) data.name = name;
  if (role) {
    if (!ROLES.includes(role)) return bad(res, 'Invalid role.');
    data.role = role;
  }
  if (disabled !== undefined) data.disabled = !!disabled;
  await db.collection('users').doc(req.params.id).update(data);
  res.json({ id: req.params.id, ...data });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (req.params.id === req.user.uid) return bad(res, 'You cannot delete your own account.');
  await auth.deleteUser(req.params.id).catch(() => {});
  await db.collection('users').doc(req.params.id).delete();
  res.json({ message: 'Deleted' });
}));

module.exports = router;
