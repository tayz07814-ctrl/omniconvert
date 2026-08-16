import type { Metadata } from 'next';
import Link from 'next/link';
import { articles } from '@/lib/seo-content';

export const metadata: Metadata = {
  title: 'File Conversion Guides',
  description: 'Practical guides to converting video, audio, images and documents safely and privately.',
};

export default function GuidesPage() {
  return <main className="seo-page">
    <nav className="seo-nav"><Link href="/" className="brand-link"><span className="mini-logo">O</span> OmniConvert</Link><Link href="/">Open converter →</Link></nav>
    <header className="listing-header"><p className="eyebrow">OMNICONVERT RESOURCE CENTER</p><h1>File conversion guides</h1><p className="lead">Straightforward answers for common conversion problems, with privacy-first workflows that keep your files in the browser.</p></header>
    <div className="listing-grid">{articles.map((article) => <Link className="listing-card" href={`/guides/${article.slug}`} key={article.slug}><span className="category-label">{article.category}</span><h2>{article.title}</h2><p>{article.description}</p><span className="learn">Read guide →</span></Link>)}</div>
  </main>;
}
