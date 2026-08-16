import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Free Online File Converter | OmniConvert',
    template: '%s | OmniConvert',
  },
  description:
    'Convert video, audio, images and documents online for free. OmniConvert processes files in your browser so your files stay on your device.',
  keywords: [
    'online file converter', 'video converter', 'image converter', 'PDF converter',
    'document converter', 'audio converter', 'free file converter',
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Free Online File Converter | OmniConvert',
    description: 'Convert video, audio, images and documents privately in your browser.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'OmniConvert',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'A free browser-based converter for video, audio, images, PDFs and common documents.',
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
