import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { FormatDef } from './formats';

const XML_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function officeParagraphs(xml: string): string[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  return Array.from(doc.getElementsByTagNameNS('*', 'p')).map((paragraph) =>
    Array.from(paragraph.getElementsByTagNameNS('*', 't'))
      .map((node) => node.textContent ?? '')
      .join(''),
  );
}

function stripMarkup(value: string): string {
  const doc = new DOMParser().parseFromString(value, 'text/html');
  return (doc.body.textContent ?? '').replace(/\u00a0/g, ' ').replace(/\r\n/g, '\n').trim();
}

function stripRtf(value: string): string {
  return value
    .replace(/\\'[0-9a-f]{2}/gi, '')
    .replace(/\\(par|line)\b/g, '\n')
    .replace(/\\[a-z]+-?\d* ?/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function zipText(zip: any, name: string): Promise<string> {
  const entry = zip.file(name);
  return entry ? entry.async('text') : '';
}

async function extractOfficeText(file: File, ext: string): Promise<string> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  if (ext === 'docx') {
    return officeParagraphs(await zipText(zip, 'word/document.xml')).join('\n').trim();
  }

  if (ext === 'pptx') {
    const slides = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return (await Promise.all(slides.map(async (name) => officeParagraphs(await zipText(zip, name)).join('\n'))))
      .filter(Boolean)
      .join('\n\n')
      .trim();
  }

  // XLSX is read as tab-separated rows. This intentionally avoids silently
  // losing values when a workbook does not contain shared strings.
  const sharedDoc = new DOMParser().parseFromString(await zipText(zip, 'xl/sharedStrings.xml'), 'application/xml');
  const shared = Array.from(sharedDoc.getElementsByTagNameNS('*', 'si')).map((item) =>
    Array.from(item.getElementsByTagNameNS('*', 't')).map((node) => node.textContent ?? '').join(''),
  );
  const sheetName = Object.keys(zip.files)
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))[0];
  if (!sheetName) return '';
  const sheet = new DOMParser().parseFromString(await zipText(zip, sheetName), 'application/xml');
  return Array.from(sheet.getElementsByTagNameNS(XML_NS, 'row')).map((row) =>
    Array.from(row.getElementsByTagNameNS(XML_NS, 'c')).map((cell) => {
      const type = cell.getAttribute('t');
      const value = type === 'inlineStr'
        ? Array.from(cell.getElementsByTagNameNS(XML_NS, 't')).map((node) => node.textContent ?? '').join('')
        : cell.getElementsByTagNameNS(XML_NS, 'v')[0]?.textContent ?? '';
      return type === 's' ? (shared[Number(value)] ?? '') : value;
    }).join('\t'),
  ).join('\n').trim();
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const lib = pdfjs.default ?? pdfjs;
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/legacy/build/pdf.worker.min.mjs`;
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: { str?: string }) => item.str ?? '').join(' '));
  }
  return pages.join('\n\n').trim();
}

export async function extractDocumentText(file: File, ext: string): Promise<string> {
  const source = ext.toLowerCase();
  if (source === 'pdf') return extractPdfText(file);
  if (source === 'docx' || source === 'xlsx' || source === 'pptx') {
    return extractOfficeText(file, source);
  }
  if (source === 'html' || source === 'htm') return stripMarkup(await file.text());
  if (source === 'rtf') return stripRtf(await file.text());
  return (await file.text()).replace(/\r\n/g, '\n').trim();
}

function splitCsv(value: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '"') {
      if (quoted && value[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell); cell = '';
    } else if (char === '\n' && !quoted) {
      row.push(cell); rows.push(row); row = []; cell = '';
    } else if (char !== '\r') cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function asRows(text: string, sourceExt: string): string[][] {
  if (sourceExt === 'csv') return splitCsv(text);
  if (sourceExt === 'json') {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => Array.isArray(item) ? item.map(String) : [JSON.stringify(item)]);
      }
    } catch { /* Treat invalid JSON as plain text. */ }
  }
  return text.split('\n').map((line) => line.split('\t'));
}

function makeCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => {
    const value = String(cell ?? '');
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(',')).join('\n');
}

async function textToPdf(text: string): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 42;
  const lineHeight = 14;
  const maxChars = 92;
  const safe = text.replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?');
  const lines = safe.split('\n').flatMap((line) => {
    if (!line) return [''];
    const chunks: string[] = [];
    for (let i = 0; i < line.length; i += maxChars) chunks.push(line.slice(i, i + maxChars));
    return chunks;
  });
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  for (const line of lines) {
    if (y < margin) { page = pdf.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
    page.drawText(line, { x: margin, y, size: 10, lineHeight, font, color: rgb(0.12, 0.12, 0.12) });
    y -= lineHeight;
  }
  return new Blob([await pdf.save()], { type: 'application/pdf' });
}

async function textToDocx(text: string): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const paragraphs = (text || '').split('\n').map((line) =>
    `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line || ' ')}</w:t></w:r></w:p>`,
  ).join('');
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

async function textToXlsx(text: string, sourceExt: string): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const rows = asRows(text, sourceExt);
  const sheetRows = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, colIndex) => {
    const col = String.fromCharCode(65 + (colIndex % 26));
    return `<c r="${col}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(String(value))}</t></is></c>`;
  }).join('')}</row>`).join('');
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.file('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>');
  zip.file('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
  zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function convertDocument(file: File, target: FormatDef): Promise<Blob> {
  const sourceExt = file.name.split('.').pop()?.toLowerCase() ?? 'txt';
  const text = await extractDocumentText(file, sourceExt);
  switch (target.ext) {
    case 'pdf': return textToPdf(text);
    case 'docx': return textToDocx(text);
    case 'xlsx': return textToXlsx(text, sourceExt);
    case 'html':
    case 'htm':
      return new Blob([`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Converted document</title></head><body><pre>${escapeXml(text)}</pre></body></html>`], { type: target.mime });
    case 'csv': return new Blob([makeCsv(asRows(text, sourceExt))], { type: target.mime });
    case 'json': {
      let value: unknown = text;
      try { value = JSON.parse(text); } catch { value = { content: text }; }
      return new Blob([JSON.stringify(value, null, 2)], { type: target.mime });
    }
    case 'xml': return new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n<document>${escapeXml(text)}</document>`], { type: target.mime });
    case 'rtf': {
      const rtfText = text.replace(/[\\{}]/g, '\\$&').replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?');
      return new Blob([`{\\rtf1\\ansi\n${rtfText.replace(/\n/g, '\\par\n')}\n}`], { type: target.mime });
    }
    default: return new Blob([text], { type: target.mime });
  }
}
