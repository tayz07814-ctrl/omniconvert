import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

// Single-threaded core: runs locally in the browser without needing
// SharedArrayBuffer / COOP-COEP headers, so it works on any static host.
const CORE_VERSION = '0.12.6';
const CORE_BASES = [
  `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`,
  `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`,
];

async function loadCore(ff: FFmpeg): Promise<void> {
  let lastError: unknown;

  for (const base of CORE_BASES) {
    try {
      await ff.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  const detail = lastError instanceof Error ? ` (${lastError.message})` : '';
  throw new Error(`Could not load the video converter. Check your connection and try again${detail}`);
}

export async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (instance && instance.loaded) {
    return instance;
  }
  if (!loading) {
    const ff = new FFmpeg();
    if (onLog) ff.on('log', ({ message }) => onLog(message));
    loading = loadCore(ff)
      .then(() => ff)
      .catch((error) => {
        // Do not poison future conversions after a transient CDN/network failure.
        instance = null;
        loading = null;
        throw error;
      });
  }
  instance = await loading;
  return instance;
}
