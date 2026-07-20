import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS, GET_SUBURB_GUIDES, GET_AGENCIES, GET_AGENTS } from '@/lib/graphql/queries';
import { filterByTerm } from '@/lib/filters';
import type { Post, SuburbGuide, Agency, Agent } from '@/lib/types';

type Props = { params: Promise<{ state: string }> };

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const name = STATE_LABELS[state] ?? state.toUpperCase();
  return { title: `${name} — Real Estate News, Guides & Agencies` };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const name = STATE_LABELS[state] ?? state.toUpperCase();

  const [{ data: postsData }, { data: guidesData }, { data: agenciesData }, { data: agentsData }] =
    await Promise.all([
      apolloClient.query({ query: GET_POSTS, variables: { first: 100 } }),
      apolloClient.query({ query: GET_SUBURB_GUIDES, variables: { first: 100 } }),
      apolloClient.query({ query: GET_AGENCIES, variables: { first: 100 } }),
      apolloClient.query({ query: GET_AGENTS, variables: { first: 100 } }),
    ]);

  const posts = filterByTerm((postsData?.posts?.nodes ?? []) as Post[], state);
  const guides = filterByTerm((guidesData?.suburbGuides?.nodes ?? []) as SuburbGuide[], state);
  const agencies = filterByTerm((agenciesData?.agencies?.nodes ?? []) as Agency[], state);
  const agents = filterByTerm((agentsData?.agents?.nodes ?? []) as Agent[], state);

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">{name}</h1>

        <h2>News</h2>
        <div className="card-grid">
          {posts.map((p) => (
            <Link key={p.id} href={p.uri} className="card">
              <div className="card-body">
                <h3>{p.title}</h3>
                <p className="muted">{formatDate(p.date)}</p>
              </div>
            </Link>
          ))}
          {posts.length === 0 && <p className="muted">No news for this state yet.</p>}
        </div>

        <h2>Suburb Guides</h2>
        <div className="card-grid">
          {guides.map((g) => (
            <Link key={g.id} href={g.uri} className="card">
              <div className="card-body">
                <h3>{g.slug.replace(/-/g, ' ')}</h3>
              </div>
            </Link>
          ))}
          {guides.length === 0 && <p className="muted">No suburb guides yet.</p>}
        </div>

        <h2>Agencies</h2>
        <div className="card-grid">
          {agencies.map((a) => (
            <Link key={a.id} href={a.uri} className="card">
              <div className="card-body">
                <h3>{a.slug.replace(/-/g, ' ')}</h3>
              </div>
            </Link>
          ))}
          {agencies.length === 0 && <p className="muted">No agencies yet.</p>}
        </div>

        <h2>Agents</h2>
        <div className="card-grid">
          {agents.map((a) => (
            <Link key={a.id} href={a.uri} className="card">
              <div className="card-body">
                <h3>{a.slug.replace(/-/g, ' ')}</h3>
              </div>
            </Link>
          ))}
          {agents.length === 0 && <p className="muted">No agents yet.</p>}
        </div>
      </div>
    </section>
  );
}
