# OmniConvert

A 100% client-side file converter (like CloudConvert) that runs entirely in your
browser. Files are never uploaded — all conversions happen locally on your device
using WASM libraries.

## Features
- **Images**: PNG, JPG, WebP, GIF, BMP, TIFF, HEIC/HEIF → image or PDF
- **Video / Audio**: MP4, WebM, MOV, AVI, MKV ↔ MP3, WAV, OGG, AAC, M4A, FLAC (ffmpeg.wasm)
- **PDF**: → PNG/JPG/WebP/GIF/BMP (zip of pages)
- Drag & drop, batch convert, per-file target format.

## Tech
Next.js (App Router, static export) · ffmpeg.wasm · pdf.js · pdf-lib · Canvas.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static output in ./out
```

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. In Vercel, import the repo. It auto-detects Next.js and builds to `out/`
   (configured via `next.config.js` `output: 'export'` + `vercel.json`).
3. Done — the app is a fully static, serverless site.

> The ffmpeg core (~30 MB WASM) is fetched from unpkg on first video/audio
> conversion, then cached by the browser. Image/PDF conversions need no download.
