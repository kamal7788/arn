import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS, GET_MARKET_REPORTS } from '@/lib/graphql/queries';
import type { Post, MarketReport } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Australian Real Estate News — Latest Market Reports & Policy Updates',
  description:
    'Stay informed with the latest Australian real estate news, market reports, suburb guides, and property policy updates.',
};

async function getLatestPosts() {
  try {
    const { data } = await apolloClient.query({
      query: GET_POSTS,
      variables: { first: 9 },
    });
    return data.posts.nodes as Post[];
  } catch {
    return [];
  }
}

async function getFeaturedReports() {
  try {
    const { data } = await apolloClient.query({
      query: GET_MARKET_REPORTS,
      variables: { first: 4 },
    });
    return data.marketReports.nodes as MarketReport[];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function HomePage() {
  const [posts, reports] = await Promise.all([getLatestPosts(), getFeaturedReports()]);

  return (
    <>
      <section style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Latest News</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Australian real estate intelligence — market data, suburb guides, and policy analysis.
        </p>
      </section>

      {reports.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Featured Market Reports</h2>
          <div className="post-grid">
            {reports.map((report) => (
              <Link key={report.id} href={`/market-report/${report.slug}`} className="post-card">
                {report.featuredImage?.node && (
                  <img src={report.featuredImage.node.sourceUrl} alt={report.featuredImage.node.altText} />
                )}
                <div className="post-card-body">
                  <h3>{report.title}</h3>
                  <div className="meta">{formatDate(report.date)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 ? (
        <section>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Recent Articles</h2>
          <div className="post-grid">
            {posts.map((post) => (
              <Link key={post.id} href={`/articles/${post.slug}`} className="post-card">
                {post.featuredImage?.node && (
                  <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText} />
                )}
                <div className="post-card-body">
                  <h3>{post.title}</h3>
                  <div className="meta">{formatDate(post.date)}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {post.categories.nodes.map((cat) => (
                      <span key={cat.id} className="badge" style={{ marginRight: '0.25rem' }}>
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <p>No articles published yet.</p>
      )}
    </>
  );
}
