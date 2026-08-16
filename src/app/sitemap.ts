import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://omniconvert-z.vercel.app';
  return ['', '/about', '/privacy', '/terms', '/contact'].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'yearly',
    priority: path === '' ? 1 : 0.5,
  }));
}
