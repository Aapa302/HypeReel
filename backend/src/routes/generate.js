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
    const uploaded = await uploadThumbnail(buffer, mimeType);

    if (!uploaded.storageUrl) {
      // Without Storage, inline the image so clients can still display it.
      return {
        storagePath: null,
        storageUrl: `data:${mimeType};base64,${buffer.toString('base64')}`,
      };
    }

    return uploaded;
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
    const doc = db
      ? await db.collection('generations').add({
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
        })
      : null;

    res.json({
      id: doc ? doc.id : null,
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
