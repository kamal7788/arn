import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POST_BY_SLUG, GET_MARKET_REPORT_BY_SLUG } from '@/lib/graphql/queries';
import type { Post, MarketReport } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  // Try regular post first
  try {
    const { data } = await apolloClient.query({
      query: GET_POST_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'no-cache',
    });
    if (data.post) return { type: 'post' as const, post: data.post as Post };
  } catch {}

  // Try market report
  try {
    const { data } = await apolloClient.query({
      query: GET_MARKET_REPORT_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'no-cache',
    });
    if (data.marketReport) return { type: 'market_report' as const, post: data.marketReport as MarketReport };
  } catch {}

  return null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticle(slug);
  if (!result) return {};
  return {
    title: result.post.title,
    description: result.post.excerpt.replace(/<[^>]+>/g, '').slice(0, 160),
    openGraph: {
      title: result.post.title,
      description: result.post.excerpt.replace(/<[^>]+>/g, ''),
      type: 'article',
      publishedTime: result.post.date,
      modifiedTime: result.post.modified,
      images: result.post.featuredImage?.node ? [{ url: result.post.featuredImage.node.sourceUrl }] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const result = await getArticle(slug);
  if (!result) notFound();

  const { post } = result;
  const isMarketReport = result.type === 'market_report';
  const report = isMarketReport ? (post as MarketReport) : null;

  return (
    <article>
      {post.featuredImage?.node && (
        <img
          src={post.featuredImage.node.sourceUrl}
          alt={post.featuredImage.node.altText}
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }}
        />
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {post.categories.nodes.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="badge">{cat.name}</Link>
        ))}
        {post.states.nodes.map((s) => (
          <Link key={s.id} href={`/state/${s.slug}`} className="badge">{s.name}</Link>
        ))}
        {post.acf?.isAiGenerated && <span className="badge" style={{ background: '#bee3f8', color: '#2a4365' }}>AI Generated</span>}
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{post.title}</h1>

      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        By {post.author.node.name} · {formatDate(post.date)}
        {post.agency?.node && <> · {post.agency.node.name}</>}
      </div>

      {report && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Key Market Metrics</h3>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="number">${(report.keyMetrics?.medianPrice || 0).toLocaleString()}</div>
              <div className="label">Median Price</div>
            </div>
            <div className="stat-card">
              <div className="number">{report.keyMetrics?.yoyChange || 0}%</div>
              <div className="label">YoY Change</div>
            </div>
            <div className="stat-card">
              <div className="number">{report.keyMetrics?.vacancyRate || 0}%</div>
              <div className="label">Vacancy Rate</div>
            </div>
            <div className="stat-card">
              <div className="number">{report.keyMetrics?.daysOnMarket || 0}</div>
              <div className="label">Days on Market</div>
            </div>
          </div>
        </div>
      )}

      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.acf?.sourceUrls && post.acf.sourceUrls.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px' }}>
          <h4>Sources</h4>
          <ul style={{ fontSize: '0.9rem' }}>
            {post.acf.sourceUrls.map((url, i) => (
              <li key={i}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)' }}>{url}</a></li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
