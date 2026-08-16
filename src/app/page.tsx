'use client';

import { useCallback, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import {
  FORMAT_MAP,
  extensionOf,
  getTargets,
  type FormatDef,
} from '@/lib/formats';
import { convertFile, type ConvertResult } from '@/lib/convert';

type Status = 'idle' | 'running' | 'done' | 'error';

interface Item {
  id: string;
  file: File;
  srcExt: string;
  targets: FormatDef[];
  target: string;
  status: Status;
  progress: number;
  result?: ConvertResult;
  error?: string;
  thumb?: string;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function baseName(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: Item[] = Array.from(files).map((file) => {
      const srcExt = extensionOf(file.name) || 'bin';
      const targets = getTargets(srcExt);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const isImage = file.type.startsWith('image/') || ['heic', 'heif', 'tif', 'tiff'].includes(srcExt);
      return {
        id,
        file,
        srcExt,
        targets,
        target: targets[0]?.ext ?? '',
        status: 'idle',
        progress: 0,
        thumb: isImage ? URL.createObjectURL(file) : undefined,
      };
    });
    setItems((prev) => [...prev, ...next]);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const setTarget = (id: string, target: string) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, target, status: 'idle', result: undefined, error: undefined } : it)),
    );

  const removeItem = (id: string) =>
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?.thumb) URL.revokeObjectURL(it.thumb);
      return prev.filter((x) => x.id !== id);
    });

  const update = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const convertOne = async (it: Item): Promise<void> => {
    if (!it.target || it.status === 'running') return;
    update(it.id, { status: 'running', progress: 0, error: undefined, result: undefined });
    try {
      const result = await convertFile(it.file, it.target, (ratio) =>
        update(it.id, { progress: Math.round(ratio * 100) }),
      );
      update(it.id, { status: 'done', progress: 100, result });
    } catch (err) {
      update(it.id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Conversion failed',
      });
    }
  };

  const convertAll = async () => {
    for (const it of items) {
      if (it.target && it.status !== 'running') await convertOne(it);
    }
  };

  const download = (it: Item) => {
    if (!it.result) return;
    const name = `${baseName(it.file.name)}.${it.result.ext}`;
    saveAs(it.result.blob, name);
  };

  const busy = items.some((i) => i.status === 'running');

  return (
    <main className="container">
      <div className="header">
        <div className="logo">O</div>
        <div className="title">OmniConvert</div>
      </div>
      <p className="subtitle">
        Convert images, audio, video and PDFs entirely in your browser. Nothing is
        uploaded — your files never leave this device.
      </p>

      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <h2>Drop files here</h2>
        <p>or click to browse — supports 100+ formats</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="toolbar">
            <div className="left">{items.length} file(s) added</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={() => setItems([])} disabled={busy}>
                Clear all
              </button>
              <button className="btn primary" onClick={convertAll} disabled={busy}>
                {busy ? 'Converting…' : 'Convert all'}
              </button>
            </div>
          </div>

          <div className="file-list">
            {items.map((it) => (
              <div className="file-row" key={it.id}>
                <div className="thumb">
                  {it.thumb ? <img src={it.thumb} alt="" /> : it.srcExt.toUpperCase()}
                </div>
                <div className="file-main">
                  <div className="file-name">{it.file.name}</div>
                  <div className="file-meta">{humanSize(it.file.size)}</div>
                  <div className="flow">
                    <span className="pill">{it.srcExt.toUpperCase()}</span>
                    <span className="arrow">→</span>
                    {it.targets.length > 0 ? (
                      <select value={it.target} onChange={(e) => setTarget(it.id, e.target.value)}>
                        {it.targets.map((t) => (
                          <option key={t.ext} value={t.ext}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="file-meta">no conversions available</span>
                    )}
                  </div>
                  {it.status !== 'idle' && (
                    <>
                      <div className="progress">
                        <span style={{ width: `${it.progress}%` }} />
                      </div>
                      {it.status === 'running' && (
                        <div className="status run">Converting… {it.progress}%</div>
                      )}
                      {it.status === 'done' && (
                        <div className="status ok">Done — ready to download</div>
                      )}
                      {it.status === 'error' && (
                        <div className="status err">{it.error}</div>
                      )}
                    </>
                  )}
                </div>
                <div className="file-actions">
                  <button
                    className="btn"
                    onClick={() => convertOne(it)}
                    disabled={!it.target || it.status === 'running'}
                  >
                    {it.status === 'running' ? 'Running…' : 'Convert'}
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => download(it)}
                    disabled={it.status !== 'done'}
                  >
                    Download
                  </button>
                  <button className="btn ghost" onClick={() => removeItem(it.id)} disabled={busy}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="footer">
        <div>
          <span className="pill">Images: PNG · JPG · WebP · GIF · BMP · TIFF · HEIC → PDF</span>
          <span className="pill">Video/Audio: MP4 · WebM · MOV · MP3 · WAV · OGG · FLAC</span>
          <span className="pill">PDF → Images (zip)</span>
        </div>
        <p>Powered by ffmpeg.wasm, pdf.js, pdf-lib &amp; Canvas. 100% client-side.</p>
      </div>
    </main>
  );
}
