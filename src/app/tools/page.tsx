import type { Metadata } from 'next';
import Link from 'next/link';
import { landingPages } from '@/lib/seo-content';

export const metadata: Metadata = {
  title: 'File Conversion Tools',
  description: 'Browse OmniConvert tools for video, audio, image, PDF and document conversion.',
};

export default function ToolsPage() {
  return <main className="seo-page">
    <nav className="seo-nav"><Link href="/" className="brand-link"><span className="mini-logo">O</span> OmniConvert</Link><Link href="/">Open converter →</Link></nav>
    <header className="listing-header"><p className="eyebrow">FREE PRIVATE TOOLS</p><h1>File conversion tools</h1><p className="lead">Find a focused guide for the conversion you need. Every supported conversion runs in your browser.</p></header>
    <div className="listing-grid">{landingPages.map((page) => <Link className="listing-card" href={`/tools/${page.slug}`} key={page.slug}><span className="card-arrow">↗</span><h2>{page.title}</h2><p>{page.description}</p><span className="learn">Learn more →</span></Link>)}</div>
  </main>;
}
