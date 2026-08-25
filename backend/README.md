# HypeReel Backend

Express-based backend API for HypeReel, providing video file upload and validation endpoints.

## Features

- **CORS Enabled**: Configured to handle requests from cross-origin frontend applications.
- **File Upload**: `POST /api/generate` accepts `multipart/form-data` with a single `video` file field.
- **File Validation**: Only video files (`video/*` MIME types) are allowed up to a maximum file size of **100MB**.
- **Error Handling**: Custom error handler for Multer limits, invalid file formats, and general server errors.

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Installation

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Optionally create a `.env` file in the `backend` folder to customize configuration:

```env
PORT=5000
```

- `PORT`: The port number on which the Express server will listen (Default: `5000`).

## Running the Server

Start the server in standard mode:

```bash
npm start
```

The server will be running at `http://localhost:5000`.

## Testing

Run the test suite with Jest and Supertest:

```bash
npm test
```

## API Specification

### `POST /api/generate`

Upload a video file for processing.

- **Request Body**: `multipart/form-data`
  - `video` (File): Video file (`video/*`), max 100MB.

- **Success Response** (`200 OK`):
  ```json
  {
    "message": "File uploaded successfully",
    "filename": "video-1700000000000-123456789.mp4",
    "originalname": "my_video.mp4",
    "size": 10485760
  }
  ```

- **Error Response** (`400 Bad Request`):
  ```json
  {
    "error": "Only video files are allowed!"
  }
  ```
  or
  ```json
  {
    "error": "File size exceeds limit of 100MB"
  }
  ```
