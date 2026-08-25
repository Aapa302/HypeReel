const express = require('express');

const { upload } = require('../middleware/upload');
const { uploadVideo } = require('../services/storage');
const { generateCaptions, selectRelevantHashtags } = require('../services/gemini');
const { getTrendingHashtags } = require('../services/hashtagCache');
const { getFirestore } = require('../config/firebase');

const router = express.Router();

router.post('/', upload.single('video'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided. Use the "video" form field.' });
    }

    const [{ storagePath, storageUrl }, captions, trendingHashtags] = await Promise.all([
      uploadVideo(req.file),
      generateCaptions(req.file),
      getTrendingHashtags(),
    ]);

    const captionContext = `${captions.descriptiveCaption}\n${captions.viralCaption}`;
    const hashtags = await selectRelevantHashtags(trendingHashtags, captionContext);

    const db = getFirestore();
    const doc = await db.collection('generations').add({
      video: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath,
        storageUrl,
      },
      descriptiveCaption: captions.descriptiveCaption,
      viralCaption: captions.viralCaption,
      hashtags,
      createdAt: new Date().toISOString(),
    });

    res.json({
      id: doc.id,
      descriptiveCaption: captions.descriptiveCaption,
      viralCaption: captions.viralCaption,
      hashtags,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
