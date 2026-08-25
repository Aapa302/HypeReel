const multer = require('multer');

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('video/')) {
      return cb(null, true);
    }
    const err = new Error('Invalid file type. Only video files are allowed.');
    err.status = 400;
    cb(err);
  },
});

module.exports = { upload, MAX_FILE_SIZE };
