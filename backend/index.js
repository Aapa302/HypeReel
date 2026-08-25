const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Enable CORS
app.use(cors());
app.use(express.json());

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for video files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    const error = new Error('Only video files are allowed!');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer upload middleware configuration (max 100MB)
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter,
});

// POST /api/generate route
app.post('/api/generate', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  res.status(200).json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds limit of 100MB' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err && err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
  next();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HypeReel backend server listening on port ${PORT}`);
  });
}

module.exports = app;
