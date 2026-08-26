const express = require('express');

const { getFirestore } = require('../config/firebase');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const db = getFirestore();

    if (!db) {
      return res.status(503).json({ error: 'Firestore is not configured.' });
    }

    const collection = db.collection('generations');

    try {
      const aggregate = await collection.count().get();
      return res.json({ generations: aggregate.data().count });
    } catch {
      // Older firebase-admin versions have no aggregation queries.
      const snapshot = await collection.select().get();
      return res.json({ generations: snapshot.size });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
