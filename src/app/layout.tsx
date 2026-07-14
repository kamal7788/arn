import type { Metadata } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_SITE_INFO } from '@/lib/graphql/queries';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Aus Real Estate News — Australian Real Estate News & Commentary',
    template: '%s | Aus Real Estate News',
  },
  description: 'Australian real estate news, market reports, suburb guides, and policy updates.',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'Aus Real Estate News',
  },
};

async function getSiteInfo() {
  try {
    const { data } = await apolloClient.query({ query: GET_SITE_INFO });
    return data.generalSettings;
  } catch {
    return { title: 'Aus Real Estate News', description: 'Australian Real Estate News', url: '' };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteInfo();

  return (
    <html lang="en-AU">
      <body>
        <header className="header">
          <div className="container">
            <Link href="/" className="logo">
              <span className="logo-mark">AR</span>
              <span className="logo-text">{site?.title || 'Aus Real Estate News'}</span>
            </Link>
            <nav className="main-nav">
              <Link href="/category/market">Market</Link>
              <Link href="/category/policy">Policy</Link>
              <Link href="/category/development">Development</Link>
              <span className="nav-divider">|</span>
              <Link href="/state/nsw">NSW</Link>
              <Link href="/state/vic">VIC</Link>
              <Link href="/state/qld">QLD</Link>
              <Link href="/state/wa">WA</Link>
              <Link href="/state/sa">SA</Link>
            </nav>
            <nav className="admin-nav">
              <Link href="/agent/dashboard" className="btn btn-sm">Agent Dashboard</Link>
              <Link href="/admin/queue" className="btn btn-sm btn-outline">Editorial Queue</Link>
              <Link href="/admin/applications" className="btn btn-sm btn-outline">Applications</Link>
            </nav>
          </div>
        </header>
        <main className="main">
          <div className="container">{children}</div>
        </main>
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-section">
                <strong>Aus Real Estate News</strong>
                <p>Australian real estate intelligence — market data, suburb guides, and policy analysis.</p>
              </div>
              <div className="footer-section">
                <strong>Markets</strong>
                <Link href="/state/nsw">NSW</Link>
                <Link href="/state/vic">VIC</Link>
                <Link href="/state/qld">QLD</Link>
                <Link href="/state/wa">WA</Link>
                <Link href="/state/sa">SA</Link>
              </div>
              <div className="footer-section">
                <strong>Categories</strong>
                <Link href="/category/market">Market Reports</Link>
                <Link href="/category/policy">Policy Updates</Link>
                <Link href="/category/development">Development</Link>
              </div>
              <div className="footer-section">
                <strong>Platform</strong>
                <Link href="/agent/dashboard">Agent Dashboard</Link>
                <Link href="/admin/queue">Editorial Queue</Link>
                <Link href="/admin/applications">Applications</Link>
              </div>
            </div>
            <div className="footer-bottom">
              &copy; {new Date().getFullYear()} Aus Real Estate News. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
