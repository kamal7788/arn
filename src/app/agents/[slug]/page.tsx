import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_AGENT } from '@/lib/graphql/queries';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function AgentPage({ params }: Props) {
  const { slug } = await params;
  const { data } = await apolloClient.query({ query: GET_AGENT, variables: { slug } });

  if (!data.agentBy) notFound();
  const agent = data.agentBy;
  const profile = agent.agentProfile ?? {};

  const agency = profile.agency?.nodes?.[0];

  return (
    <section className="section">
      <div className="container narrow">
        <Link href="/agents" className="back-link">&larr; All agents</Link>
        <div className="agent-header">
          {agent.featuredImage?.node?.sourceUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="agent-avatar" src={agent.featuredImage.node.sourceUrl} alt={agent.featuredImage.node.altText} />
          )}
          <div>
            <h1 className="page-title">{agent.slug.replace(/-/g, ' ')}</h1>
            {agency && (
              <p>
                <Link href={`/agencies/${agency.slug}`} className="tag">{agency.slug.replace(/-/g, ' ')}</Link>
              </p>
            )}
          </div>
        </div>

        {profile.bio && <div className="prose" dangerouslySetInnerHTML={{ __html: profile.bio }} />}
        {agent.content && <div className="prose" dangerouslySetInnerHTML={{ __html: agent.content }} />}

        <div className="agent-contact">
          {profile.email && <a href={`mailto:${profile.email}`}>Email</a>}
          {profile.phone && <a href={`tel:${profile.phone}`}>Call {profile.phone}</a>}
          {profile.realestateProfile && (
            <a href={profile.realestateProfile} target="_blank" rel="noopener noreferrer">realestate.com.au</a>
          )}
          {profile.domainProfile && (
            <a href={profile.domainProfile} target="_blank" rel="noopener noreferrer">domain.com.au</a>
          )}
          {profile.facebook && (
            <a href={profile.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          )}
        </div>
      </div>
    </section>
  );
}
