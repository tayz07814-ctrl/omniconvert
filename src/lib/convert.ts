import {
  FORMAT_MAP,
  categoryForExt,
  extensionOf,
  type FormatDef,
} from './formats';
import { canvasToBmp } from './bmp';
import { getFFmpeg } from './ffmpeg';
import { convertDocument } from './documents';

export interface ConvertResult {
  blob: Blob;
  ext: string;
  mime: string;
}

export type ProgressFn = (ratio: number, message?: string) => void;

function loadImageEl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = url;
  });
}

async function decodeImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  const ext = extensionOf(file.name);
  const url = URL.createObjectURL(file);
  try {
    if (ext === 'heic' || ext === 'heif') {
      const { default: heic2any } = await import('heic2any');
      const out = (await heic2any({ blob: file, toType: 'image/png' })) as Blob;
      const pngUrl = URL.createObjectURL(out);
      try {
        const img = await loadImageEl(pngUrl);
        return drawToCanvas(img);
      } finally {
        URL.revokeObjectURL(pngUrl);
      }
    }
    if (ext === 'tif' || ext === 'tiff') {
      const UTIF = await import('utif');
      const buffer = await file.arrayBuffer();
      const ifds = UTIF.decode(buffer);
      if (!ifds.length) throw new Error('Invalid TIFF');
      UTIF.decodeImage(buffer, ifds[0], ifds[0]);
      const rgba = UTIF.toRGBA8(ifds[0]);
      const canvas = document.createElement('canvas');
      canvas.width = ifds[0].width;
      canvas.height = ifds[0].height;
      const ctx = canvas.getContext('2d')!;
      const imgData = ctx.createImageData(canvas.width, canvas.height);
      imgData.data.set(rgba);
      ctx.putImageData(imgData, 0, 0);
      return canvas;
    }
    const img = await loadImageEl(url);
    return drawToCanvas(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  canvas.getContext('2d')!.drawImage(img, 0, 0);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, ext: string): Promise<Blob> {
  if (ext === 'bmp') return Promise.resolve(canvasToBmp(canvas));
  if (ext === 'svg') {
    const png = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image href="${png}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
    return Promise.resolve(new Blob([svg], { type: mime }));
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Encode failed'))),
      mime,
      0.92,
    );
  });
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function canvasToPdf(canvas: HTMLCanvasElement): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const pngBytes = dataUrlToBytes(canvas.toDataURL('image/png'));
  const pdfDoc = await PDFDocument.create();
  const png = await pdfDoc.embedPng(pngBytes);
  const page = pdfDoc.addPage([png.width, png.height]);
  page.drawImage(png, { x: 0, y: 0, width: png.width, height: png.height });
  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

async function pdfToImages(file: File, target: FormatDef): Promise<Blob[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const lib = pdfjs.default ?? pdfjs;
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/legacy/build/pdf.worker.min.mjs`;

  const data = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data }).promise;
  const blobs: Blob[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    blobs.push(await canvasToBlob(canvas, target.mime, target.ext));
  }
  return blobs;
}

async function convertWithFFmpeg(
  file: File,
  targetExt: string,
  onProgress?: ProgressFn,
): Promise<ConvertResult> {
  const ff = await getFFmpeg();
  const srcExt = extensionOf(file.name) || 'dat';
  // Unique names prevent a failed conversion from poisoning the next one in
  // ffmpeg.wasm's in-memory filesystem.
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const inputName = `input-${id}.${srcExt}`;
  const outputName = `output-${id}.${targetExt}`;
  const def = FORMAT_MAP[targetExt];
  let lastLog = '';
  const onLog = ({ message }: { message: string }) => { lastLog = message; };
  const onProg = ({ progress }: { progress: number }) => {
    if (Number.isFinite(progress)) onProgress?.(Math.min(1, Math.max(0, progress)));
  };

  ff.on('log', onLog);
  if (onProgress) ff.on('progress', onProg);
  try {
    await ff.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    const audioOnly = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(targetExt);
    const args = ['-y', '-i', inputName];
    if (audioOnly) {
      args.push('-vn');
      if (targetExt === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', '192k');
      if (targetExt === 'wav') args.push('-c:a', 'pcm_s16le');
      if (targetExt === 'ogg') args.push('-c:a', 'libvorbis', '-q:a', '5');
      if (targetExt === 'aac') args.push('-c:a', 'aac', '-b:a', '192k');
      if (targetExt === 'm4a') args.push('-c:a', 'aac', '-b:a', '192k');
      if (targetExt === 'flac') args.push('-c:a', 'flac');
    } else if (targetExt === 'mp4' || targetExt === 'm4v' || targetExt === 'mov') {
      args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k');
      if (targetExt === 'mp4' || targetExt === 'm4v') args.push('-movflags', '+faststart');
    } else if (targetExt === 'webm') {
      args.push('-c:v', 'libvpx', '-crf', '30', '-b:v', '0', '-c:a', 'libvorbis');
    }
    args.push(outputName);

    let code = await ff.exec(args);
    // Some browser-core builds omit an encoder. Let ffmpeg choose compatible
    // codecs before returning a failure for video container conversions.
    if (code !== 0 && !audioOnly) {
      await ff.deleteFile(outputName).catch(() => undefined);
      code = await ff.exec(['-y', '-i', inputName, outputName]);
    }
    if (code !== 0) throw new Error(lastLog || 'FFmpeg could not convert this video.');

    const out = (await ff.readFile(outputName)) as Uint8Array;
    return {
      blob: new Blob([out], { type: def?.mime || 'application/octet-stream' }),
      ext: targetExt,
      mime: def?.mime || 'application/octet-stream',
    };
  } finally {
    ff.off('log', onLog);
    if (onProgress) ff.off('progress', onProg);
    await ff.deleteFile(inputName).catch(() => undefined);
    await ff.deleteFile(outputName).catch(() => undefined);
  }
}

export async function convertFile(
  file: File,
  targetExt: string,
  onProgress?: ProgressFn,
): Promise<ConvertResult> {
  const srcExt = extensionOf(file.name);
  const srcCat = categoryForExt(srcExt);
  const tgtDef = FORMAT_MAP[targetExt.toLowerCase()];
  if (!tgtDef) throw new Error(`Unsupported target: ${targetExt}`);

  if (srcCat === 'image') {
    const canvas = await decodeImageToCanvas(file);
    if (targetExt === 'pdf') {
      const blob = await canvasToPdf(canvas);
      return { blob, ext: 'pdf', mime: 'application/pdf' };
    }
    const blob = await canvasToBlob(canvas, tgtDef.mime, targetExt);
    return { blob, ext: targetExt, mime: tgtDef.mime };
  }

  if (srcCat === 'document') {
    if (srcExt === 'pdf' && tgtDef.category === 'image') {
      const images = await pdfToImages(file, tgtDef);
      if (images.length === 1) {
        return { blob: images[0], ext: targetExt, mime: tgtDef.mime };
      }
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      images.forEach((b, i) => zip.file(`page-${String(i + 1).padStart(3, '0')}.${targetExt}`, b));
      const blob = await zip.generateAsync({ type: 'blob' });
      return { blob, ext: 'zip', mime: 'application/zip' };
    }
    const blob = await convertDocument(file, tgtDef);
    return { blob, ext: targetExt, mime: tgtDef.mime };
  }

  if (srcCat === 'video' || srcCat === 'audio') {
    return convertWithFFmpeg(file, targetExt, onProgress);
  }

  throw new Error(`Unsupported conversion: ${srcExt} -> ${targetExt}`);
}
