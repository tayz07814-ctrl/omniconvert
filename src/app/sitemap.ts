import type { MetadataRoute } from 'next';
import { articles, landingPages } from '@/lib/seo-content';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://omniconvert-z.vercel.app';
  const staticPages = ['', '/about', '/privacy', '/terms', '/contact', '/tools', '/guides'];
  const toolPages = landingPages.map((page) => `/tools/${page.slug}`);
  const guidePages = articles.map((article) => `/guides/${article.slug}`);
  return [...staticPages, ...toolPages, ...guidePages].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/tools' || path === '/guides' ? 0.8 : 0.6,
  }));
}
