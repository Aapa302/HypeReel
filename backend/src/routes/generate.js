const express = require('express');

const { upload } = require('../middleware/upload');
const { uploadVideo, uploadThumbnail } = require('../services/storage');
const {
  generateCaptions,
  selectRelevantHashtags,
  generateThumbnail,
} = require('../services/gemini');
const { getTrendingHashtags } = require('../services/hashtagCache');
const { getFirestore } = require('../config/firebase');

const router = express.Router();

async function createThumbnail(captions) {
  try {
    const { buffer, mimeType } = await generateThumbnail(captions);
    return await uploadThumbnail(buffer, mimeType);
  } catch (err) {
    // A missing thumbnail should not fail the whole generation.
    console.error('Thumbnail generation failed:', err);
    return { storagePath: null, storageUrl: null };
  }
}

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

    const [hashtags, thumbnail] = await Promise.all([
      selectRelevantHashtags(trendingHashtags, captionContext),
      createThumbnail(captions),
    ]);

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
      thumbnailPath: thumbnail.storagePath,
      thumbnailUrl: thumbnail.storageUrl,
      createdAt: new Date().toISOString(),
    });

    res.json({
      id: doc.id,
      descriptiveCaption: captions.descriptiveCaption,
      viralCaption: captions.viralCaption,
      hashtags,
      thumbnailUrl: thumbnail.storageUrl,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
