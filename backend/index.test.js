const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./index');

describe('POST /api/generate', () => {
  const dummyVideoPath = path.join(__dirname, 'test_sample.mp4');
  const dummyTxtPath = path.join(__dirname, 'test_sample.txt');
  const dummyLargePath = path.join(__dirname, 'test_large.mp4');

  beforeAll(() => {
    // Create test files
    fs.writeFileSync(dummyVideoPath, Buffer.alloc(1024, 'a')); // 1KB fake mp4
    fs.writeFileSync(dummyTxtPath, 'hello world text file');
  });

  afterAll(() => {
    // Clean up created test files
    if (fs.existsSync(dummyVideoPath)) fs.unlinkSync(dummyVideoPath);
    if (fs.existsSync(dummyTxtPath)) fs.unlinkSync(dummyTxtPath);
    if (fs.existsSync(dummyLargePath)) fs.unlinkSync(dummyLargePath);
  });

  it('should accept valid video file and return 200 with filename', async () => {
    const response = await request(app)
      .post('/api/generate')
      .attach('video', dummyVideoPath, { contentType: 'video/mp4' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'File uploaded successfully');
    expect(response.body).toHaveProperty('filename');
    expect(response.body).toHaveProperty('originalname', 'test_sample.mp4');

    // Clean up uploaded file
    const uploadedFilePath = path.join(__dirname, 'uploads', response.body.filename);
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  });

  it('should reject non-video files with 400 status', async () => {
    const response = await request(app)
      .post('/api/generate')
      .attach('video', dummyTxtPath, { contentType: 'text/plain' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Only video files are allowed!');
  });

  it('should return 400 if no file is provided', async () => {
    const response = await request(app).post('/api/generate');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'No video file provided');
  });

  it('should reject files exceeding size limit with 400 status', async () => {
    // Create file slightly larger than 100MB (101MB)
    const buf = Buffer.alloc(1024 * 1024, 'x'); // 1MB buffer
    const fd = fs.openSync(dummyLargePath, 'w');
    for (let i = 0; i < 101; i++) {
      fs.writeSync(fd, buf);
    }
    fs.closeSync(fd);

    const response = await request(app)
      .post('/api/generate')
      .attach('video', dummyLargePath, { contentType: 'video/mp4' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'File size exceeds limit of 100MB');
  }, 30000);
});
