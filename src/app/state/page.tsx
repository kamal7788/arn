import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_STATES } from '@/lib/graphql/queries';

export const metadata: Metadata = {
  title: 'All States — Australian Real Estate News',
  description: 'Browse real estate news by Australian state and territory.',
};

const STATE_SLUGS: Record<string, { name: string; abbr: string }> = {
  nsw: { name: 'New South Wales', abbr: 'NSW' },
  vic: { name: 'Victoria', abbr: 'VIC' },
  qld: { name: 'Queensland', abbr: 'QLD' },
  wa:  { name: 'Western Australia', abbr: 'WA' },
  sa:  { name: 'South Australia', abbr: 'SA' },
  tas: { name: 'Tasmania', abbr: 'TAS' },
  act: { name: 'Australian Capital Territory', abbr: 'ACT' },
  nt:  { name: 'Northern Territory', abbr: 'NT' },
};

async function getStates() {
  try {
    const { data } = await apolloClient.query({ query: GET_STATES, fetchPolicy: 'no-cache' });
    return data.states.nodes as { slug: string; name: string; count: number }[];
  } catch {
    return [];
  }
}

export default async function StateHubPage() {
  const states = await getStates();

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>States &amp; Territories</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          Real estate news across all Australian states and territories.
        </p>
      </div>

      <div className="state-grid">
        {Object.entries(STATE_SLUGS).map(([slug, info]) => {
          const wpState = states.find((s) => s.slug === slug);
          const count = wpState?.count || 0;
          return (
            <Link key={slug} href={`/state/${slug}`} className="state-card">
              <div className="state-card-abbr">{info.abbr}</div>
              <div className="state-card-name">{info.name}</div>
              <div className="state-card-count">
                {count} {count === 1 ? 'article' : 'articles'}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
