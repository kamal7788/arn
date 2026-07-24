import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Aus Real Estate News — Australian Real Estate News & Commentary',
    template: '%s | Aus Real Estate News',
  },
  description: 'Australian real estate news, suburb guides, and agency directory.',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'Aus Real Estate News',
  },
};

const STATE_LIST = [
  { slug: 'nsw', name: 'NSW' },
  { slug: 'vic', name: 'VIC' },
  { slug: 'qld', name: 'QLD' },
  { slug: 'wa', name: 'WA' },
  { slug: 'sa', name: 'SA' },
  { slug: 'tas', name: 'TAS' },
  { slug: 'act', name: 'ACT' },
  { slug: 'nt', name: 'NT' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>
        <div className="sheet">
          <Header />
          <main className="main">
            {children}
          </main>
          <footer className="footer">
            <div className="container">
              <div className="footer-grid">
                <div className="footer-section">
                  <strong>Aus Real Estate News</strong>
                  <p>Australian real estate intelligence — news, suburb guides, and agency directory.</p>
                </div>
                <div className="footer-section">
                  <strong>Content</strong>
                  <Link href="/">News</Link>
                  <Link href="/suburb-guides">Suburb Guides</Link>
                  <Link href="/agencies">Agencies</Link>
                  <Link href="/agents">Agents</Link>
                </div>
                <div className="footer-section">
                  <strong>States</strong>
                  {STATE_LIST.map((s) => (
                    <Link key={s.slug} href={`/state/${s.slug}`}>{s.name}</Link>
                  ))}
                </div>
                <div className="footer-section">
                  <strong>More</strong>
                  <Link href="/search">Search</Link>
                </div>
              </div>
              <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Aus Real Estate News. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
