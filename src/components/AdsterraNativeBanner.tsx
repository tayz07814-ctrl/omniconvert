'use client';

import Script from 'next/script';

export default function AdsterraNativeBanner() {
  return (
    <section className="ad-slot native-ad" aria-label="Advertisement">
      <p className="ad-label">Advertisement</p>
      <Script
        id="adsterra-native-banner"
        src="https://pl30879602.effectivecpmnetwork.com/91306ec615e001a069f3291f745a8908/invoke.js"
        strategy="afterInteractive"
        data-cfasync="false"
      />
      <div id="container-91306ec615e001a069f3291f745a8908" />
    </section>
  );
}
