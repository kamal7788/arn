import type { Metadata } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_SITE_INFO } from '@/lib/graphql/queries';
import Header from '@/components/Header';
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
        <Header />
        <main className="main">
          <div className="container">{children}</div>
        </main>
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-section">
                <strong>{site?.title || 'Aus Real Estate News'}</strong>
                <p>Australian real estate intelligence — market data, suburb guides, and policy analysis.</p>
              </div>
              <div className="footer-section">
                <strong>Categories</strong>
                <a href="/category/market">Market</a>
                <a href="/category/policy">Policy</a>
                <a href="/category/development">Development</a>
                <a href="/category/technology">Technology</a>
                <a href="/category/finance">Finance</a>
              </div>
              <div className="footer-section">
                <strong>States</strong>
                <a href="/state/nsw">NSW</a>
                <a href="/state/vic">VIC</a>
                <a href="/state/qld">QLD</a>
                <a href="/state/wa">WA</a>
                <a href="/state/sa">SA</a>
                <a href="/state/tas">TAS</a>
                <a href="/state/act">ACT</a>
                <a href="/state/nt">NT</a>
              </div>
              <div className="footer-section">
                <strong>Platform</strong>
                <a href="/agent/dashboard">Agent Dashboard</a>
                <a href="/admin/queue">Editorial Queue</a>
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
