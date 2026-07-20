import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_AGENCY, GET_AGENTS } from '@/lib/graphql/queries';
import AgencyMap from '@/components/AgencyMap';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function AgencyPage({ params }: Props) {
  const { slug } = await params;
  const { data } = await apolloClient.query({ query: GET_AGENCY, variables: { slug } });

  if (!data.agencyBy) notFound();
  const a = data.agencyBy;
  const profile = a.agencyProfile ?? {};

  return (
    <section className="section">
      <div className="container">
        <Link href="/agencies" className="back-link">&larr; All agencies</Link>
        <h1 className="page-title">{a.slug.replace(/-/g, ' ')}</h1>

        <div className="agency-grid">
          <div>
            {profile.description && (
              <div className="prose" dangerouslySetInnerHTML={{ __html: profile.description }} />
            )}
            {a.content && <div className="prose" dangerouslySetInnerHTML={{ __html: a.content }} />}

            <div className="agency-links">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer">Website</a>
              )}
              {profile.socialLinks?.facebook && (
                <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              )}
              {profile.socialLinks?.instagram && (
                <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              )}
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              )}
            </div>

            {profile.agents?.nodes?.length > 0 && (
              <div className="agents-list">
                <h2>Agents at this agency</h2>
                <ul>
                  {profile.agents.nodes.map((agent: { slug: string; uri: string }) => (
                    <li key={agent.slug}>
                      <Link href={agent.uri}>{agent.slug.replace(/-/g, ' ')}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside>
            <AgencyMap placeId={profile.googlePlaceId} address={profile.address} />
          </aside>
        </div>
      </div>
    </section>
  );
}
