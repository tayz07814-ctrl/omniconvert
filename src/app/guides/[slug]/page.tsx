import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { articles } from '@/lib/seo-content';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: `/guides/${article.slug}` } };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) notFound();
  return <main className="seo-page">
    <nav className="seo-nav"><Link href="/" className="brand-link"><span className="mini-logo">O</span> OmniConvert</Link><Link href="/guides">All guides →</Link></nav>
    <article className="guide-article">
      <p className="eyebrow">{article.category} GUIDE · UPDATED {article.updated}</p>
      <h1>{article.title}</h1>
      <p className="lead">{article.description}</p>
      {article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
      <div className="article-cta"><strong>Ready to try a private converter?</strong><p>Convert your file in the browser with no account and no upload step.</p><Link className="btn primary" href="/">Open OmniConvert →</Link></div>
    </article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description, dateModified: article.updated, author: { '@type': 'Organization', name: 'OmniConvert' }, publisher: { '@type': 'Organization', name: 'OmniConvert' } }) }} />
  </main>;
}
