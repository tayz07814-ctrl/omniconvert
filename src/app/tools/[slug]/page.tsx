import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { landingPages } from '@/lib/seo-content';

export function generateStaticParams() {
  return landingPages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = landingPages.find((item) => item.slug === params.slug);
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/tools/${page.slug}` } };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const page = landingPages.find((item) => item.slug === params.slug);
  if (!page) notFound();
  const faqSchema = page.faq.map((item) => ({
    '@type': 'Question', name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  }));

  return <main className="seo-page">
    <nav className="seo-nav"><Link href="/" className="brand-link"><span className="mini-logo">O</span> OmniConvert</Link><Link href="/">Open converter →</Link></nav>
    <header className="seo-hero">
      <p className="eyebrow">PRIVATE ONLINE TOOL · {page.from} → {page.to}</p>
      <h1>{page.title}</h1>
      <p className="lead">{page.intro}</p>
      <Link className="btn primary hero-cta" href="/">Start converting free <span>→</span></Link>
    </header>
    <div className="seo-layout">
      <article>
        <h2>Why use OmniConvert?</h2>
        <div className="benefit-grid">{page.benefits.map((benefit) => <div className="benefit" key={benefit}><span className="check">✓</span><span>{benefit}</span></div>)}</div>
        <h2>How to convert {page.from} to {page.to}</h2>
        <ol className="article-steps">{page.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <h2>Frequently asked questions</h2>
        <div className="faq-list">{page.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      </article>
      <aside className="seo-aside"><div className="aside-card"><strong>Your files stay on your device</strong><p>Conversion happens in your browser. There is no OmniConvert upload queue and no account required.</p><Link href="/guides/how-to-convert-files-online-safely">Read our privacy guide →</Link></div><div className="aside-card"><strong>More tools</strong><p><Link href="/tools/video-converter">Video converter</Link><br /><Link href="/tools/heic-to-jpg">HEIC to JPG</Link><br /><Link href="/tools/pdf-to-jpg">PDF to JPG</Link></p></div></aside>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqSchema }) }} />
  </main>;
}
