# HypeReel Backend

Node.js + Express backend for HypeReel. Accepts a video upload, stores it in Firebase Storage, uses Google Gemini to generate a descriptive caption and a catchy/viral caption, picks 8-10 relevant trending hashtags (fetched via Gemini with web search grounding and cached for 3 hours), generates an AI thumbnail image for the video with Gemini image generation, and saves everything to Firestore.

## API

### `GET /health`

Health check. Returns `{ "status": "ok" }`.

### `POST /api/generate`

- Content type: `multipart/form-data`
- Field: `video` — a video file (any `video/*` MIME type, max 100MB)

Example:

```bash
curl -X POST http://localhost:3000/api/generate \
  -F "video=@/path/to/clip.mp4"
```

Response:

```json
{
  "id": "<firestore-doc-id>",
  "descriptiveCaption": "...",
  "viralCaption": "...",
  "hashtags": ["#tag1", "#tag2", "..."],
  "thumbnailUrl": "https://firebasestorage.googleapis.com/v0/b/<bucket>/o/thumbnails%2F...?alt=media&token=..."
}
```

| Field | Description |
| --- | --- |
| `id` | Firestore document ID in the `generations` collection |
| `descriptiveCaption` | Caption describing what happens in the video |
| `viralCaption` | Catchy, ready-to-post caption |
| `hashtags` | 8-10 relevant trending hashtags |
| `thumbnailUrl` | Public URL of the AI-generated thumbnail image in Firebase Storage. `null` if thumbnail generation failed (the rest of the response is still returned) |

## Required environment variables

| Variable | Description |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account client email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (keep the `\n` sequences; the app converts them to real newlines) |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket name, e.g. `my-project.appspot.com` |
| `GEMINI_API_KEY` | Google AI Studio API key for Gemini |
| `PORT` | Optional, defaults to `3000` |
| `GEMINI_MODEL` | Optional, defaults to `gemini-2.0-flash` |
| `GEMINI_IMAGE_MODEL` | Optional, defaults to `gemini-2.0-flash-preview-image-generation` (image generation model used for the thumbnail) |

## Local setup

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in `backend/` (never commit it):

   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   GEMINI_API_KEY=your-gemini-api-key
   ```

   Get the Firebase values from a service account key: Firebase Console → Project settings → Service accounts → Generate new private key. Get the Gemini key from [Google AI Studio](https://aistudio.google.com/apikey).

3. Run the server:

   ```bash
   npm start        # or: npm run dev (auto-restarts on changes)
   ```

4. Test: `curl http://localhost:3000/health`

## Deploying to Render

1. Push this repository to GitHub.
2. In [Render](https://dashboard.render.com), click **New → Web Service** and connect the repo.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance type**: free tier works for testing
4. Under **Environment**, add the variables listed above (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`, `GEMINI_API_KEY`). Paste the private key with its `\n` sequences intact.
5. Deploy. Render sets `PORT` automatically; the server binds to it.
6. Verify with `https://<your-service>.onrender.com/health`.

## Notes

- Trending hashtags are cached in memory for 3 hours to avoid redundant Gemini calls; the first request after a cold start or cache expiry is slower.
- Each generation is saved to the Firestore `generations` collection with video metadata, both captions, the selected hashtags, and the thumbnail (`thumbnailUrl` plus its `thumbnailPath` in the bucket).
- The thumbnail is generated from the descriptive caption and the viral caption's theme, aiming for a bold, high-CTR, vertical 9:16 image, then uploaded to `thumbnails/` in Firebase Storage with a download token so the URL is publicly readable.
- Thumbnail generation is best effort: if the image model or the upload fails, the request still succeeds and `thumbnailUrl` is `null`.
