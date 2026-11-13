// Builds a full REST router (list / get / create / update / delete) from one
// entry in config/resources.js.  This is why there is no controller per module.
const express = require('express');
const { db } = require('../config/firebase');
const { allow } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const httpError = (status, message) => Object.assign(new Error(message), { status });
const isLearner = (role) => role === 'student' || role === 'parent';

// Keep only allowed fields, trim strings
function pick(body, fields) {
  const out = {};
  for (const f of fields) {
    if (body[f] !== undefined) out[f] = typeof body[f] === 'string' ? body[f].trim() : body[f];
  }
  return out;
}

// For each ref, copy the name of the linked document (e.g. classId -> className)
async function applyRefs(data, refs) {
  for (const ref of refs) {
    const id = data[ref.idField];
    if (id === undefined) continue;
    if (!id) { data[ref.nameField] = ''; continue; }
    const snap = await db.collection(ref.collection).doc(id).get();
    if (!snap.exists) throw httpError(400, `${ref.idField} does not exist`);
    data[ref.nameField] = snap.data()[ref.from] || '';
  }
  return data;
}

function buildRouter(name, cfg) {
  const router = express.Router();
  const col = db.collection(name);

  // LIST
  router.get('/', allow(...cfg.read), asyncHandler(async (req, res) => {
    let q = col;
    for (const f of cfg.filters || []) {
      if (req.query[f]) q = q.where(f, '==', f === 'year' ? Number(req.query[f]) : req.query[f]);
    }
    if (cfg.scoped && isLearner(req.user.role)) {
      const ids = req.user.linkedStudentIds.slice(0, 30);
      if (!ids.length) return res.json([]);
      q = q.where('studentId', 'in', ids);
    }
    const snap = await q.limit(1000).get();
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const key = cfg.sortBy;
    if (key) {
      rows.sort((a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, { numeric: true }));
      if (cfg.sortDesc) rows.reverse();
    }
    res.json(rows);
  }));

  // GET ONE
  router.get('/:id', allow(...cfg.read), asyncHandler(async (req, res) => {
    const snap = await col.doc(req.params.id).get();
    if (!snap.exists) throw httpError(404, 'Not found');
    const row = { id: snap.id, ...snap.data() };
    if (cfg.scoped && isLearner(req.user.role) && !req.user.linkedStudentIds.includes(row.studentId)) {
      throw httpError(403, 'You are not allowed to see this.');
    }
    res.json(row);
  }));

  if (!cfg.write.length) return router;

  // CREATE
  router.post('/', allow(...cfg.write), asyncHandler(async (req, res) => {
    let data = pick(req.body, cfg.fields);
    for (const f of cfg.required) {
      if (data[f] === undefined || data[f] === '') throw httpError(400, `"${f}" is required`);
    }
    data = await applyRefs(data, cfg.refs || []);
    if (cfg.transform) data = cfg.transform(data);
    const now = new Date().toISOString();
    const ref = await col.add({ ...data, createdAt: now, updatedAt: now, createdBy: req.user.uid });
    res.status(201).json({ id: ref.id, ...data });
  }));

  // UPDATE
  router.put('/:id', allow(...cfg.write), asyncHandler(async (req, res) => {
    const ref = col.doc(req.params.id);
    if (!(await ref.get()).exists) throw httpError(404, 'Not found');
    let data = pick(req.body, cfg.fields);
    for (const f of cfg.required) {
      if (data[f] === '') throw httpError(400, `"${f}" is required`);
    }
    data = await applyRefs(data, cfg.refs || []);
    if (cfg.transform) data = cfg.transform(data);
    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    res.json({ id: ref.id, ...data });
  }));

  // DELETE
  router.delete('/:id', allow(...cfg.write), asyncHandler(async (req, res) => {
    await col.doc(req.params.id).delete();
    res.json({ message: 'Deleted' });
  }));

  return router;
}

module.exports = buildRouter;
