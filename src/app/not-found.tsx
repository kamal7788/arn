import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="not-found-page">
      <div className="container narrow" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '4rem', fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page not found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          background: 'var(--color-accent)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          fontWeight: 600,
        }}>
          Back to News
        </Link>
      </div>
    </section>
  );
}
