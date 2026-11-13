const { db, auth } = require('../config/firebase');

// 1) Reads "Authorization: Bearer <Firebase ID token>", verifies it with Firebase,
// 2) loads the person's profile (role etc.) from the `users` collection.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please sign in.' });

    const decoded = await auth.verifyIdToken(token);
    const snap = await db.collection('users').doc(decoded.uid).get();
    if (!snap.exists) {
      return res.status(403).json({ message: 'Your account has no role yet. Ask an administrator.' });
    }
    const profile = snap.data();
    if (profile.disabled) return res.status(403).json({ message: 'This account is disabled.' });

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: profile.name || decoded.email,
      role: profile.role,
      linkedStudentIds: profile.linkedStudentIds || [],
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

// Use after authenticate:  router.post('/', allow('admin'), handler)
const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You are not allowed to do this.' });

module.exports = { authenticate, allow };
