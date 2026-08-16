import type { Metadata } from 'next';
import Script from 'next/script';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://omniconvert-z.vercel.app'),
  openGraph: {
    title: 'Free Online File Converter | OmniConvert',
    description: 'Convert video, audio, images and documents privately in your browser.',
    type: 'website',
    url: 'https://omniconvert-z.vercel.app',
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
        <Script
          id="adsterra-popunder"
          src="https://pl30879599.effectivecpmnetwork.com/e9/6f/e1/e96fe1046676b4f698a2ad2b69e938be.js"
          strategy="afterInteractive"
        />
        <Script
          id="adsterra-social-bar"
          src="https://pl30879600.effectivecpmnetwork.com/5c/f7/9d/5cf79d3c4a14154fd900b11156815714.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
