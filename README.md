# OmniConvert

OmniConvert is a free, privacy-first file converter. Conversion happens locally in the browser, so selected files are not uploaded to an OmniConvert application server.

## Features

- **Images**: PNG, JPG/JPEG, WebP, SVG, GIF, BMP, TIFF, HEIC/HEIF and ICO input; reliable PNG, JPG, WebP, BMP, SVG and PDF output.
- **Video**: MP4, WebM, MOV, AVI, MKV and M4V conversions with FFmpeg WebAssembly.
- **Audio**: MP3, WAV, OGG, AAC, M4A and FLAC conversions.
- **Documents**: PDF pages to image ZIPs, PDF text extraction, TXT, Markdown, HTML, CSV, JSON, XML, RTF, DOCX, XLSX and PPTX text extraction/conversion.
- Drag and drop, batch conversion, progress reporting and browser-only processing.

Animated GIFs and complex office layouts are flattened to their readable content when converted; this tool does not promise pixel-perfect office-document round trips.

## Tech

Next.js App Router · FFmpeg WebAssembly · pdf.js · pdf-lib · Canvas · JSZip.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Deploy

The app works on Vercel or another Node-compatible Next.js host. Set `NEXT_PUBLIC_SITE_URL` to the public site URL so the generated sitemap and robots file contain the correct canonical host.

The FFmpeg core (about 30 MB) is fetched from a public CDN the first time a video/audio conversion is used. Image and document conversions do not require that download.
