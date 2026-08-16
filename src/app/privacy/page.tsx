import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'OmniConvert privacy policy and information about local file processing.',
};

export default function PrivacyPage() {
  return <main className="info-page">
    <a href="/">← Back to OmniConvert</a>
    <h1>Privacy Policy</h1>
    <p><strong>Last updated: August 16, 2026</strong></p>
    <h2>Files you convert</h2>
    <p>OmniConvert processes selected files in your browser. Files are not uploaded to or stored on an OmniConvert application server. Downloaded results remain under your control.</p>
    <h2>Third-party resources</h2>
    <p>Some tools download open-source WebAssembly and worker resources from public content delivery networks when needed. Those requests may include normal browser information such as your IP address. No file contents are sent to OmniConvert by the converter.</p>
    <h2>Analytics and advertising</h2>
    <p>If analytics or advertising services are enabled on this site, those providers may use cookies or similar technologies according to their own policies. This page will be updated when such services are added.</p>
    <h2>Contact</h2>
    <p>For privacy questions, contact us through the <a href="/contact">contact page</a>.</p>
  </main>;
}
