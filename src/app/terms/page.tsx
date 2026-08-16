import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for the OmniConvert online file conversion tool.',
};

export default function TermsPage() {
  return <main className="info-page">
    <a href="/">← Back to OmniConvert</a>
    <h1>Terms of Use</h1>
    <p>OmniConvert is provided as a free tool on an “as is” and “as available” basis. You are responsible for ensuring that you have the right to use and convert your files.</p>
    <h2>Acceptable use</h2>
    <p>Do not use OmniConvert to process unlawful content, infringe another person’s rights or attempt to disrupt the service. Keep a copy of important originals before conversion.</p>
    <h2>Results and availability</h2>
    <p>Conversion quality depends on your browser, device and the selected formats. We do not guarantee that every conversion will be successful or preserve every feature of the original file.</p>
    <h2>Changes</h2>
    <p>We may improve, update or discontinue features as the service evolves. Continued use after changes means you accept the updated terms.</p>
  </main>;
}
