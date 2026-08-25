const crypto = require('crypto');
const path = require('path');

const { getBucket } = require('../config/firebase');

async function uploadVideo(file) {
  const bucket = getBucket();

  const ext = path.extname(file.originalname) || '.mp4';
  const fileName = `videos/${Date.now()}-${crypto.randomUUID()}${ext}`;
  const blob = bucket.file(fileName);

  const downloadToken = crypto.randomUUID();

  await blob.save(file.buffer, {
    contentType: file.mimetype,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
        originalName: file.originalname,
      },
    },
  });

  const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${downloadToken}`;

  return { storagePath: fileName, storageUrl };
}

const IMAGE_EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

async function uploadThumbnail(buffer, mimeType) {
  const bucket = getBucket();

  const ext = IMAGE_EXTENSIONS[mimeType] || '.png';
  const fileName = `thumbnails/${Date.now()}-${crypto.randomUUID()}${ext}`;
  const blob = bucket.file(fileName);

  const downloadToken = crypto.randomUUID();

  await blob.save(buffer, {
    contentType: mimeType,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${downloadToken}`;

  return { storagePath: fileName, storageUrl };
}

module.exports = { uploadVideo, uploadThumbnail };
