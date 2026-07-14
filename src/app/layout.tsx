import type { Metadata } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_SITE_INFO } from '@/lib/graphql/queries';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AusRealNews — Australian Real Estate News',
    template: '%s | AusRealNews',
  },
  description: 'Australian real estate news, market reports, suburb guides, and policy updates.',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'AusRealNews',
  },
};

async function getSiteInfo() {
  try {
    const { data } = await apolloClient.query({ query: GET_SITE_INFO });
    return data.generalSettings;
  } catch {
    return { title: 'AusRealNews', description: 'Australian Real Estate News', url: '' };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteInfo();

  return (
    <html lang="en-AU">
      <body>
        <header className="header">
          <div className="container">
            <Link href="/"><strong>{site?.title || 'AusRealNews'}</strong></Link>
            <nav>
              <Link href="/category/market">Market</Link>
              <Link href="/category/policy">Policy</Link>
              <Link href="/category/development">Development</Link>
              <Link href="/state/nsw">NSW</Link>
              <Link href="/state/vic">VIC</Link>
              <Link href="/state/qld">QLD</Link>
              <Link href="/agent/dashboard">Agent Dashboard</Link>
              <Link href="/admin/queue">Editorial Queue</Link>
            </nav>
          </div>
        </header>
        <main className="main">
          <div className="container">{children}</div>
        </main>
        <footer className="footer">
          <div className="container">
            &copy; {new Date().getFullYear()} AusRealNews. Australian Real Estate News Platform.
          </div>
        </footer>
      </body>
    </html>
  );
}
