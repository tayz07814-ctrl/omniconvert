'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { saveAs } from 'file-saver';
import {
  extensionOf,
  getTargets,
  type FormatDef,
} from '@/lib/formats';
import { convertFile, type ConvertResult } from '@/lib/convert';
import AdsterraNativeBanner from '@/components/AdsterraNativeBanner';

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

  const clearAll = () => {
    items.forEach((it) => { if (it.thumb) URL.revokeObjectURL(it.thumb); });
    setItems([]);
  };

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
      <header className="header">
        <div className="logo" aria-hidden="true">O</div>
        <div className="title">OmniConvert</div>
        <nav className="nav" aria-label="Main navigation">
          <a href="/tools">Tools</a>
          <a href="/guides">Guides</a>
          <a href="#how-it-works">How it works</a>
          <a href="/about">About</a>
        </nav>
      </header>
      <section className="hero-copy">
        <p className="eyebrow">PRIVATE BY DESIGN · FAST BY DEFAULT</p>
        <h1>Convert files.<br /><span>Keep them private.</span></h1>
        <p className="subtitle">Free online video, audio, image, PDF and document conversion. Everything happens in your browser—your files are never uploaded to our servers.</p>
      </section>

      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Choose files to convert"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <h2>Drop files here</h2>
        <p>or click to browse — supports popular video, audio, image and document formats</p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*,audio/*,image/*,.pdf,.txt,.md,.html,.htm,.csv,.json,.xml,.rtf,.docx,.xlsx,.pptx"
          multiple
          hidden
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      <AdsterraNativeBanner />

      <section className="feature-grid" aria-label="OmniConvert benefits">
        <div className="feature-card"><span className="feature-icon">◉</span><strong>100% private</strong><p>Files stay in your browser, not on an upload queue.</p></div>
        <div className="feature-card"><span className="feature-icon">✦</span><strong>Powerful formats</strong><p>Video, audio, image, PDF and common office formats.</p></div>
        <div className="feature-card"><span className="feature-icon">↯</span><strong>One-click results</strong><p>Batch your work and download results immediately.</p></div>
      </section>

      <section className="popular-section" aria-labelledby="popular-heading">
        <div><p className="eyebrow">POPULAR CONVERSIONS</p><h2 id="popular-heading">Tools for your next file</h2></div>
        <div className="popular-links"><a href="/tools/heic-to-jpg">HEIC → JPG <span>↗</span></a><a href="/tools/mp4-to-mp3">MP4 → MP3 <span>↗</span></a><a href="/tools/pdf-to-jpg">PDF → JPG <span>↗</span></a><a href="/tools/video-converter">Video converter <span>↗</span></a></div>
      </section>

      {items.length > 0 && (
        <>
          <div className="toolbar">
            <div className="left">{items.length} file(s) added</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={clearAll} disabled={busy}>
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
                  {it.thumb ? <Image src={it.thumb} alt="" width={44} height={44} unoptimized /> : it.srcExt.toUpperCase()}
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

      <section className="content-section" id="how-it-works">
        <h2>Convert files privately in three steps</h2>
        <div className="steps">
          <div><strong>1. Choose a file</strong><span>Drag and drop or browse from your device.</span></div>
          <div><strong>2. Select an output</strong><span>Pick a compatible image, video, audio or document format.</span></div>
          <div><strong>3. Download</strong><span>Convert locally and download the result immediately.</span></div>
        </div>
        <p className="small-copy">OmniConvert uses Canvas, pdf.js, pdf-lib, JSZip and ffmpeg.wasm. Video and audio tools download the open-source FFmpeg engine when first used; your file remains in your browser.</p>
      </section>

      <section className="content-section" id="faq">
        <h2>Frequently asked questions</h2>
        <details><summary>Are my files uploaded?</summary><p>No. Conversion runs locally in your browser. Large video files may use substantial memory and processing power on your device.</p></details>
        <details><summary>Which files can I convert?</summary><p>Common video and audio containers, popular image formats, PDF, plain-text formats, DOCX, XLSX and PPTX are supported. PDF pages can also be exported as images.</p></details>
        <details><summary>Why does the first video conversion take longer?</summary><p>The browser downloads and initializes the FFmpeg WebAssembly engine once. Later conversions can reuse it while this tab is open.</p></details>
      </section>

      <footer className="footer">
        <div>
          <span className="pill">Images: PNG · JPG · WebP · SVG · GIF · BMP · TIFF · HEIC</span>
          <span className="pill">Video/audio: MP4 · WebM · MOV · MP3 · WAV · OGG · FLAC</span>
          <span className="pill">Documents: PDF · DOCX · XLSX · TXT · CSV · JSON</span>
        </div>
        <p>Free browser-based conversion with no account required.</p>
        <p><a href="/about">About</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a> · <a href="https://github.com/tayz07814-ctrl/omniconvert" target="_blank" rel="noopener">GitHub</a></p>
        <p><a href="https://www.effectivecpmnetwork.com/nu4tvkfn?key=01794e3496fc7f512df5538953637ce0" target="_blank" rel="sponsored nofollow noopener">Sponsored link</a></p>
      </footer>
    </main>
  );
}
