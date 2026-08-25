const admin = require('firebase-admin');

let initialized = false;

function initFirebase() {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error(
      'Missing Firebase configuration. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and FIREBASE_STORAGE_BUCKET.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      // Render/most hosts store the key with literal "\n" sequences.
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
    storageBucket,
  });

  initialized = true;
}

function getFirestore() {
  initFirebase();
  return admin.firestore();
}

function getBucket() {
  initFirebase();
  return admin.storage().bucket();
}

module.exports = { getFirestore, getBucket };
