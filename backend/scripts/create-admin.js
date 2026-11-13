// Creates the FIRST administrator.
//   npm run create-admin -- you@school.com "StrongPassword" "Your Name"
const { db, auth } = require('../src/config/firebase');

(async () => {
  const [email, password, name = 'Administrator'] = process.argv.slice(2);
  if (!email || !password) {
    console.log('Usage: npm run create-admin -- <email> <password> "<Full Name>"');
    process.exit(1);
  }
  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log('Auth user already exists, promoting to admin...');
  } catch {
    user = await auth.createUser({ email, password, displayName: name });
  }
  await db.collection('users').doc(user.uid).set(
    { name, email, role: 'admin', linkedStudentIds: [], createdAt: new Date().toISOString() },
    { merge: true }
  );
  console.log(`Admin ready: ${email}`);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
