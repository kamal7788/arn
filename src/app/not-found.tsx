import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="not-found-page">
      <div className="container narrow" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="not-found-icon" style={{ fontSize: '5rem', marginBottom: '1rem' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 15L10 55V105H45V75H75V105H110V55L60 15Z" stroke="currentColor" strokeWidth="4" fill="none"/>
            <rect x="50" y="85" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none"/>
            <line x1="60" y1="40" x2="60" y2="55" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <line x1="52.5" y1="47.5" x2="67.5" y2="47.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '4rem', marginBottom: '0.25rem', color: 'var(--ink-muted)' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          This page hasn&apos;t been built yet.
        </h2>
        <p style={{ color: 'var(--ink-secondary)', marginBottom: '2rem' }}>
          We&apos;re still working on this part of the site. In the meantime, check out the latest news.
        </p>
        <Link href="/" className="not-found-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Take me home
        </Link>
      </div>
    </section>
  );
}
