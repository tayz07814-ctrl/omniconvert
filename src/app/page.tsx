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
  message?: string;
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
    update(it.id, { status: 'running', progress: 0, error: undefined, result: undefined, message: 'Preparing file…' });
    try {
      const result = await convertFile(it.file, it.target, (ratio, message) =>
        update(it.id, { progress: Math.round(ratio * 100), message }),
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
      <header className="site-header">
        <div className="brand"><div className="logo">O</div><div className="title">OmniConvert</div></div>
        <div className="privacy-badge"><span /> Files stay on your device</div>
      </header>

      <section className="hero">
        <p className="eyebrow">PRIVATE FILE CONVERTER</p>
        <h1>Change formats.<br /><em>Keep control.</em></h1>
        <p className="subtitle">Convert images, video, audio and PDFs directly in your browser. No upload queue, no account, no copies of your files.</p>
        <div className="format-strip"><span>Images</span><i>•</i><span>Video</span><i>•</i><span>Audio</span><i>•</i><span>PDF</span></div>
      </section>

      <section
        className={`dropzone ${drag ? 'drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <div className="upload-icon">↑</div>
        <h2>Drop files to start converting</h2>
        <p>Drag &amp; drop anywhere here, or choose files from your device.</p>
        <button className="browse" type="button">Choose files</button>
        <small>Multiple files supported · Video conversions load a one-time browser engine</small>
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
      </section>

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
                        <div className="status run">{it.message ?? 'Converting…'} {it.progress > 0 ? `${it.progress}%` : ''}</div>
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

      <section className="trust-grid">
        <div><b>01</b><h3>Private by design</h3><p>Your file is processed in this browser, not sent to a server.</p></div>
        <div><b>02</b><h3>Built for batches</h3><p>Add several files and choose a different output for each one.</p></div>
        <div><b>03</b><h3>Video, included</h3><p>Video and audio run through a local browser engine; the first use may take a moment to load.</p></div>
      </section>

      <footer className="footer"><span>Images · Video · Audio · PDF</span><span>100% browser-based</span></footer>
    </main>
  );
}
