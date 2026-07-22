import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_SUBURB_GUIDES, GET_TAXONOMY_TERMS } from '@/lib/graphql/queries';
import { filterBySuburb, bySlug } from '@/lib/filters';
import type { SuburbGuide, TaxonomyTerm } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.replace(/-/g, ' ')} — Suburb Guide` };
}

export default async function SuburbPage({ params }: Props) {
  const { slug } = await params;
  const label = slug.replace(/-/g, ' ');

  const [{ data: guidesData }, { data: termsData }] = await Promise.all([
    apolloClient.query({ query: GET_SUBURB_GUIDES, variables: { first: 100 } }),
    apolloClient.query({ query: GET_TAXONOMY_TERMS, variables: { taxonomy: 'SUBURB' } }),
  ]);

  const guides = filterBySuburb((guidesData?.suburbGuides?.nodes ?? []) as SuburbGuide[], slug);
  const term = bySlug((termsData?.terms?.nodes ?? []) as TaxonomyTerm[], slug);

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">{term?.name ?? label}</h1>
        <div className="card-grid">
          {guides.map((g) => (
            <Link key={g.id} href={`/suburb-guides/${g.slug}`} className="card">
              <div className="card-body">
                <h3>{g.slug.replace(/-/g, ' ')}</h3>
                {g.states?.nodes?.[0] && <p className="muted">{g.states.nodes[0].name}</p>}
              </div>
            </Link>
          ))}
          {guides.length === 0 && <p className="muted">No suburb guides for this suburb yet.</p>}
        </div>
      </div>
    </section>
  );
}
