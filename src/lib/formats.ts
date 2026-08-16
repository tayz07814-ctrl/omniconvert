export type Category = 'image' | 'video' | 'audio' | 'document';

export interface FormatDef {
  ext: string;
  label: string;
  mime: string;
  category: Category;
}

export const FORMATS: FormatDef[] = [
  // Images
  { ext: 'png', label: 'PNG', mime: 'image/png', category: 'image' },
  { ext: 'jpg', label: 'JPG', mime: 'image/jpeg', category: 'image' },
  { ext: 'jpeg', label: 'JPEG', mime: 'image/jpeg', category: 'image' },
  { ext: 'webp', label: 'WebP', mime: 'image/webp', category: 'image' },
  { ext: 'gif', label: 'GIF', mime: 'image/gif', category: 'image' },
  { ext: 'bmp', label: 'BMP', mime: 'image/bmp', category: 'image' },
  { ext: 'ico', label: 'ICO', mime: 'image/x-icon', category: 'image' },
  { ext: 'tif', label: 'TIFF', mime: 'image/tiff', category: 'image' },
  { ext: 'tiff', label: 'TIFF', mime: 'image/tiff', category: 'image' },
  { ext: 'heic', label: 'HEIC', mime: 'image/heic', category: 'image' },
  { ext: 'heif', label: 'HEIF', mime: 'image/heif', category: 'image' },
  { ext: 'svg', label: 'SVG', mime: 'image/svg+xml', category: 'image' },
  // Video
  { ext: 'mp4', label: 'MP4', mime: 'video/mp4', category: 'video' },
  { ext: 'webm', label: 'WebM', mime: 'video/webm', category: 'video' },
  { ext: 'mov', label: 'MOV', mime: 'video/quicktime', category: 'video' },
  { ext: 'avi', label: 'AVI', mime: 'video/x-msvideo', category: 'video' },
  { ext: 'mkv', label: 'MKV', mime: 'video/x-matroska', category: 'video' },
  { ext: 'm4v', label: 'M4V', mime: 'video/x-m4v', category: 'video' },
  // Audio
  { ext: 'mp3', label: 'MP3', mime: 'audio/mpeg', category: 'audio' },
  { ext: 'wav', label: 'WAV', mime: 'audio/wav', category: 'audio' },
  { ext: 'ogg', label: 'OGG', mime: 'audio/ogg', category: 'audio' },
  { ext: 'aac', label: 'AAC', mime: 'audio/aac', category: 'audio' },
  { ext: 'm4a', label: 'M4A', mime: 'audio/mp4', category: 'audio' },
  { ext: 'flac', label: 'FLAC', mime: 'audio/flac', category: 'audio' },
  // Documents (all conversions are performed locally in the browser)
  { ext: 'pdf', label: 'PDF', mime: 'application/pdf', category: 'document' },
  { ext: 'txt', label: 'Plain text', mime: 'text/plain', category: 'document' },
  { ext: 'md', label: 'Markdown', mime: 'text/markdown', category: 'document' },
  { ext: 'html', label: 'HTML', mime: 'text/html', category: 'document' },
  { ext: 'htm', label: 'HTML', mime: 'text/html', category: 'document' },
  { ext: 'csv', label: 'CSV', mime: 'text/csv', category: 'document' },
  { ext: 'json', label: 'JSON', mime: 'application/json', category: 'document' },
  { ext: 'xml', label: 'XML', mime: 'application/xml', category: 'document' },
  { ext: 'rtf', label: 'RTF', mime: 'application/rtf', category: 'document' },
  { ext: 'docx', label: 'Word (DOCX)', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document' },
  { ext: 'xlsx', label: 'Excel (XLSX)', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'document' },
  { ext: 'pptx', label: 'PowerPoint (PPTX)', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'document' },
];

export const FORMAT_MAP: Record<string, FormatDef> = Object.fromEntries(
  FORMATS.map((f) => [f.ext, f]),
);

// Canvas can reliably encode these formats. GIF/HEIC/TIFF/ICO are input formats;
// advertising them as outputs would produce a mislabeled PNG in some browsers.
const IMAGE_OUTPUTS = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg', 'pdf'];
const DOCUMENT_OUTPUTS = [
  'pdf', 'txt', 'md', 'html', 'htm', 'csv', 'json', 'xml', 'rtf', 'docx', 'xlsx',
];

export function categoryForExt(ext: string): Category | undefined {
  return FORMAT_MAP[ext.toLowerCase()]?.category;
}

export function extensionOf(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function getTargets(srcExt: string): FormatDef[] {
  const src = FORMAT_MAP[srcExt.toLowerCase()];
  if (!src) return [];
  if (src.category === 'image') {
    return FORMATS.filter(
      (f) => IMAGE_OUTPUTS.includes(f.ext) && f.ext !== src.ext,
    );
  }
  if (src.category === 'video') {
    return FORMATS.filter(
      (f) => (f.category === 'video' || f.category === 'audio') && f.ext !== src.ext,
    );
  }
  if (src.category === 'audio') {
    return FORMATS.filter((f) => f.category === 'audio' && f.ext !== src.ext);
  }
  if (src.category === 'document') {
    if (src.ext === 'pdf') {
      return FORMATS.filter((f) =>
        IMAGE_OUTPUTS.includes(f.ext) || DOCUMENT_OUTPUTS.includes(f.ext),
      ).filter((f) => f.ext !== src.ext);
    }
    return FORMATS.filter((f) => DOCUMENT_OUTPUTS.includes(f.ext) && f.ext !== src.ext);
  }
  return [];
}
