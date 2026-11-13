// Mounts every route under /api. Everything here requires a signed-in user.
const express = require('express');
const { authenticate } = require('../middleware/auth');
const resources = require('../config/resources');
const buildRouter = require('./crud');

const router = express.Router();

router.use(authenticate);

// "Who am I?" - the frontend calls this right after Firebase login
router.get('/auth/me', (req, res) => res.json(req.user));

router.use('/dashboard', require('./dashboard'));
router.use('/users', require('./users'));
router.use('/attendance', require('./attendance')); // bulk save (must come before the generic one)

// students, teachers, classes, subjects, results, attendance(read) ...
for (const [name, cfg] of Object.entries(resources)) {
  router.use(`/${name}`, buildRouter(name, cfg));
}

module.exports = router;
