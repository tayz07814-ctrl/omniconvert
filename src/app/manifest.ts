import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OmniConvert — Private File Converter',
    short_name: 'OmniConvert',
    description: 'Convert files privately in your browser.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080d18',
    theme_color: '#080d18',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
