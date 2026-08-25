const admin = require('firebase-admin');

const REQUIRED_VARS = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET',
];

let initialized = false;
let warned = false;

function missingVars() {
  return REQUIRED_VARS.filter((name) => !process.env[name]);
}

function isFirebaseConfigured() {
  return missingVars().length === 0;
}

function initFirebase() {
  if (initialized) return true;

  const missing = missingVars();

  if (missing.length > 0) {
    if (!warned) {
      warned = true;
      console.warn(
        `Firebase is not configured (missing ${missing.join(', ')}). Storage uploads and Firestore saves will be skipped.`
      );
    }
    return false;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Render/most hosts store the key with literal "\n" sequences.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  initialized = true;
  return true;
}

function getFirestore() {
  if (!initFirebase()) return null;
  return admin.firestore();
}

function getBucket() {
  if (!initFirebase()) return null;
  return admin.storage().bucket();
}

module.exports = { isFirebaseConfigured, initFirebase, getFirestore, getBucket };
