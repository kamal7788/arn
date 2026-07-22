import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_AGENCIES } from '@/lib/graphql/queries';
import type { Agency } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Agencies',
  description: 'Directory of Australian real estate agencies.',
};

export default async function AgenciesPage() {
  const { data } = await apolloClient.query({ query: GET_AGENCIES, variables: { first: 48 } });
  const agencies = (data?.agencies?.nodes ?? []) as Agency[];

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">Agencies</h1>
        <div className="card-grid">
          {agencies.map((a) => (
            <Link key={a.id} href={`/agencies/${a.slug}`} className="card">
              {a.featuredImage?.node?.sourceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.featuredImage.node.sourceUrl} alt={a.featuredImage.node.altText} />
              )}
              <div className="card-body">
                <h3>{a.slug.replace(/-/g, ' ')}</h3>
                {a.agencyProfile?.website && <p className="muted">{a.agencyProfile.website}</p>}
                {a.states?.nodes?.[0] && <p className="muted">{a.states.nodes[0].name}</p>}
              </div>
            </Link>
          ))}
          {agencies.length === 0 && <p className="muted">No agencies yet.</p>}
        </div>
      </div>
    </section>
  );
}
