import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_SUBURB_GUIDES } from '@/lib/graphql/queries';
import type { SuburbGuide } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Suburb Guides',
  description: 'Detailed guides for Australian suburbs.',
};

export default async function SuburbGuidesPage() {
  const { data } = await apolloClient.query({ query: GET_SUBURB_GUIDES, variables: { first: 48 } });
  const guides = (data?.suburbGuides?.nodes ?? []) as SuburbGuide[];

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">Suburb Guides</h1>
        <div className="card-grid">
          {guides.map((g) => (
            <Link key={g.id} href={g.uri} className="card">
              {g.featuredImage?.node?.sourceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.featuredImage.node.sourceUrl} alt={g.featuredImage.node.altText} />
              )}
              <div className="card-body">
                <h3>{g.slug.replace(/-/g, ' ')}</h3>
                <p className="muted">
                  {[g.states?.nodes?.[0]?.name, g.suburbs?.nodes?.[0]?.name].filter(Boolean).join(', ')}
                </p>
              </div>
            </Link>
          ))}
          {guides.length === 0 && <p className="muted">No suburb guides yet.</p>}
        </div>
      </div>
    </section>
  );
}
