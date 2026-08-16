import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniConvert — Convert files locally',
  description:
    'Free, private file converter. Images, audio, video and PDFs are converted entirely in your browser — nothing is uploaded.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
