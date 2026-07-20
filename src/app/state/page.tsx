import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_TAXONOMY_TERMS } from '@/lib/graphql/queries';
import type { TaxonomyTerm } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Browse by State',
  description: 'Australian real estate news, guides, and agencies by state and territory.',
};

const STATE_LABELS: Record<string, string> = {
  nsw: 'New South Wales',
  vic: 'Victoria',
  qld: 'Queensland',
  wa: 'Western Australia',
  sa: 'South Australia',
  tas: 'Tasmania',
  act: 'Australian Capital Territory',
  nt: 'Northern Territory',
};

export default async function StatesPage() {
  let states: TaxonomyTerm[] = [];
  try {
    const { data } = await apolloClient.query({
      query: GET_TAXONOMY_TERMS,
      variables: { taxonomy: 'STATE' },
    });
    states = (data?.terms?.nodes ?? []) as TaxonomyTerm[];
  } catch {
    states = [];
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">Browse by State</h1>
        <div className="state-grid">
          {states.map((s) => (
            <Link key={s.slug} href={`/state/${s.slug}`} className="state-card">
              <h3>{STATE_LABELS[s.slug] ?? s.name}</h3>
              <p className="muted">{s.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
