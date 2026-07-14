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
      variables: { first: 12 },
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
      <section className="hero">
        <div className="container">
          <h1>Australian Real Estate News</h1>
          <p>
            Market intelligence, suburb guides, and policy analysis for the Australian property market.
          </p>
        </div>
      </section>

      {reports.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h2>Featured Market Reports</h2>
            <Link href="/category/market">View All</Link>
          </div>
          <div className="post-grid post-grid-featured">
            {reports.map((report) => (
              <Link key={report.id} href={`/market-report/${report.slug}`} className="post-card">
                {report.featuredImage?.node && (
                  <img src={report.featuredImage.node.sourceUrl} alt={report.featuredImage.node.altText} />
                )}
                <div className="post-card-body">
                  <span className="badge badge-market">Market Report</span>
                  <h3 style={{ marginTop: '0.5rem' }}>{report.title}</h3>
                  <div className="meta">{formatDate(report.date)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 ? (
        <section>
          <div className="section-header">
            <h2>Latest Articles</h2>
          </div>
          <div className="post-grid">
            {posts.map((post) => (
              <Link key={post.id} href={`/articles/${post.slug}`} className="post-card">
                {post.featuredImage?.node && (
                  <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText} />
                )}
                <div className="post-card-body">
                  <div style={{ marginBottom: '0.5rem' }}>
                    {post.categories.nodes.map((cat) => (
                      <span key={cat.id} className="badge badge-category" style={{ marginRight: '0.25rem' }}>
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  <h3>{post.title}</h3>
                  <div className="meta">{formatDate(post.date)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <h2>No articles published yet</h2>
          <p>Content will appear here once articles are published in the CMS.</p>
        </div>
      )}
    </>
  );
}
