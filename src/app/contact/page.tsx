import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact OmniConvert',
  description: 'Contact OmniConvert with questions, feedback or conversion bug reports.',
};

export default function ContactPage() {
  return <main className="info-page">
    <a href="/">← Back to OmniConvert</a>
    <h1>Contact OmniConvert</h1>
    <p>Found a conversion problem or have a suggestion? We would like to hear from you.</p>
    <p><a className="btn primary contact-link" href="https://github.com/tayz07814-ctrl/omniconvert/issues">Open a GitHub issue</a></p>
    <p>When reporting a bug, include the source format, target format, browser and a short description. Please do not attach confidential files.</p>
  </main>;
}
