// Connects to Firebase ONCE. Every other file imports { db, auth } from here.
require('dotenv').config();
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    // Option B: three separate values (good for hosting platforms)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Option A: GOOGLE_APPLICATION_CREDENTIALS points to the JSON key file
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
}

module.exports = { admin, db: admin.firestore(), auth: admin.auth() };
