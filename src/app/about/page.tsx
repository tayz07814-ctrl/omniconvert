import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About OmniConvert',
  description: 'Learn how OmniConvert provides private, browser-based file conversion.',
};

export default function AboutPage() {
  return <main className="info-page">
    <a href="/">← Back to OmniConvert</a>
    <h1>About OmniConvert</h1>
    <p>OmniConvert is a free browser-based file conversion tool for people who want a quick way to convert common video, audio, image and document files.</p>
    <h2>Private by design</h2>
    <p>Conversions run on your device using open-source browser technologies. We do not require an account and do not upload the files you select to an OmniConvert server.</p>
    <h2>Simple and useful</h2>
    <p>Choose a file, select a compatible output format and download the result. Video and audio conversion uses FFmpeg WebAssembly; image and document tools use browser APIs and open-source libraries.</p>
  </main>;
}
