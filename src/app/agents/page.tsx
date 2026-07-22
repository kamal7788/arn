import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_AGENTS } from '@/lib/graphql/queries';
import type { Agent } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Agents',
  description: 'Directory of Australian real estate agents.',
};

export default async function AgentsPage() {
  const { data } = await apolloClient.query({ query: GET_AGENTS, variables: { first: 80 } });
  const agents = (data?.agents?.nodes ?? []) as Agent[];

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">Agents</h1>
        <div className="card-grid">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.slug}`} className="card agent-card">
              {agent.featuredImage?.node?.sourceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agent.featuredImage.node.sourceUrl} alt={agent.featuredImage.node.altText} />
              )}
              <div className="card-body">
                <h3>{agent.slug.replace(/-/g, ' ')}</h3>
                {agent.agentProfile?.agency?.nodes?.[0] && (
                  <p className="muted">
                    {agent.agentProfile.agency.nodes[0].slug.replace(/-/g, ' ')}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {agents.length === 0 && <p className="muted">No agents yet.</p>}
        </div>
      </div>
    </section>
  );
}
