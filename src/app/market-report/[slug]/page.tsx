import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apolloClient } from '@/lib/apollo-client';
import { GET_MARKET_REPORT_BY_SLUG } from '@/lib/graphql/queries';
import type { MarketReport } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await apolloClient.query({
      query: GET_MARKET_REPORT_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'no-cache',
    });
    if (!data.marketReport) return {};
    return {
      title: data.marketReport.title,
      description: `Market report: ${data.marketReport.title}`,
      openGraph: { title: data.marketReport.title, type: 'article' },
    };
  } catch {
    return {};
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function MarketReportPage({ params }: Props) {
  const { slug } = await params;
  let report: MarketReport | null = null;

  try {
    const { data } = await apolloClient.query({
      query: GET_MARKET_REPORT_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'no-cache',
    });
    report = data.marketReport;
  } catch {}

  if (!report) notFound();

  const m: { medianPrice?: number; yoyChange?: number; vacancyRate?: number; daysOnMarket?: number } = report.keyMetrics || {};

  return (
    <article>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: '#2b6cb0', color: 'white' }}>Market Report</span>
        {report.states?.nodes?.map((s) => (
          <span key={s.id} className="badge">{s.name}</span>
        ))}
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{report.title}</h1>

      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        {report.author.node.name} · {formatDate(report.date)}
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Key Market Metrics</h3>
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="number">${(m.medianPrice || 0).toLocaleString()}</div>
            <div className="label">Median Price</div>
          </div>
          <div className="stat-card">
            <div className="number">{m.yoyChange || 0}%</div>
            <div className="label">YoY Change</div>
          </div>
          <div className="stat-card">
            <div className="number">{m.vacancyRate || 0}%</div>
            <div className="label">Vacancy Rate</div>
          </div>
          <div className="stat-card">
            <div className="number">{m.daysOnMarket || 0}</div>
            <div className="label">Days on Market</div>
          </div>
        </div>
      </div>

      <div className="article-content" dangerouslySetInnerHTML={{ __html: report.content }} />
    </article>
  );
}
