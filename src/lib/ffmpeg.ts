import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

// Single-threaded core: runs locally in the browser without needing
// SharedArrayBuffer / COOP-COEP headers, so it works on any static host.
const CORE_VERSION = '0.12.6';
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

export async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (instance && instance.loaded) {
    return instance;
  }
  if (!loading) {
    const ff = new FFmpeg();
    if (onLog) ff.on('log', ({ message }) => onLog(message));
    loading = (async () => {
      try {
        await ff.load({
          coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        return ff;
      } catch (error) {
        // Allow a retry after a transient CDN/network failure.
        loading = null;
        instance = null;
        throw new Error('Video engine could not load. Check your connection and try again.');
      }
    })();
  }
  instance = await loading;
  return instance;
}
