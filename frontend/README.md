# HypeReel Frontend

React + Vite single-page app for HypeReel. Upload a short video and get back an AI-generated thumbnail, a descriptive caption, a viral caption and trending hashtags — served by the [HypeReel backend](../backend/README.md).

The UI is a dark, premium, 3D-animated landing page: floating glass/metallic shapes rendered with React Three Fiber, glassmorphic cards with 3D tilt on hover, gradient typography and scroll-triggered animations.

## Stack

| Purpose | Library |
| --- | --- |
| Build tool | Vite |
| UI | React 19 |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` |
| Animation | `framer-motion` |
| Styling | `tailwindcss` |
| HTTP | `axios` |

## Local setup

Requires Node.js 20.19+ (or 22.12+).

```bash
cd frontend
npm install
cp .env.example .env    # then edit VITE_API_URL
npm run dev             # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Base URL of the HypeReel backend, without a trailing slash (e.g. `http://localhost:3000` locally, `https://hypereel-backend.onrender.com` in production). The app posts the video to `${VITE_API_URL}/api/generate`. |

Vite only exposes variables prefixed with `VITE_`, and they are inlined at **build time** — changing `VITE_API_URL` requires a rebuild/redeploy. Local values go in `frontend/.env` (git-ignored).

If `VITE_API_URL` is missing or the backend is unreachable, the upload card shows an inline error instead of failing silently.

## How it works

1. A video is dropped on (or picked from) the glassmorphic upload card.
2. A preview frame is extracted **in the browser** from the file itself with a hidden `<video>` element drawn onto a `<canvas>` (`src/lib/videoThumbnail.js`) — no upload needed for the preview.
3. Pressing **Generate hype** posts the file as `multipart/form-data` (field name `video`) to `POST /api/generate`, with an animated upload progress bar driven by axios' `onUploadProgress`.
4. While the backend works, a rotating 3D orb and "Processing your video…" state are shown.
5. On success the results section renders the backend's `thumbnailUrl` (with a Download button), both captions (each with Copy) and the hashtags as tappable pills plus **Copy all**. A `null` `thumbnailUrl` is handled with an inline notice.

Layout is mobile-first and responsive; `three.js` is loaded lazily so the first paint stays light on phones.

## Deploying to Render (static site)

1. Push this repository to GitHub.
2. In the [Render dashboard](https://dashboard.render.com), click **New → Static Site** and connect the repo.
3. Configure the site:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment**, add `VITE_API_URL` pointing at the deployed backend (e.g. `https://hypereel-backend.onrender.com`, no trailing slash). If the backend runs on Render's free tier, the first request after idling can take ~30s while it wakes up.
5. Add a rewrite rule so client-side routing and deep links work: **Redirects/Rewrites → Add rule** with Source `/*`, Destination `/index.html`, Action **Rewrite**.
6. Deploy. Render sets `NODE_VERSION` to a recent default; if the build fails on the Node version, add a `NODE_VERSION` environment variable of `22.12.0`.

The backend already enables CORS for all origins, so no extra configuration is needed there. Re-deploy the static site whenever `VITE_API_URL` changes.
