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

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').slice(0, 120);
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

  const featuredGuides = guides.slice(0, 3);
  const featuredAgencies = agencies.slice(0, 3);
  const featuredAgents = agents.slice(0, 5);

  return (
    <section className="state-page">
      <div className="container">
        <h1 className="page-title">{name}</h1>

        <div className="state-layout">
          <div className="state-main">
            <h2>News in {name}</h2>
            <div className="news-grid">
              {posts.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="news-card">
                  <div className="news-card-image">
                    {p.featuredImage?.node?.sourceUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.featuredImage.node.sourceUrl} alt={p.featuredImage.node.altText || p.title} />
                    ) : (
                      <div className="news-card-fallback">AR</div>
                    )}
                  </div>
                  <div className="news-card-body">
                    {p.categories?.nodes?.[0] && (
                      <span className="tag">{p.categories.nodes[0].name}</span>
                    )}
                    <h3>{p.title}</h3>
                    <p className="news-excerpt">{stripHtml(p.excerpt)}</p>
                    <span className="news-date">{formatDate(p.date)}</span>
                  </div>
                </Link>
              ))}
              {posts.length === 0 && <p className="muted">No news for this state yet.</p>}
            </div>
          </div>

          <aside className="state-sidebar">
            {featuredGuides.length > 0 && (
              <div className="sidebar-section">
                <h3>Suburb Guides</h3>
                <ul className="sidebar-list">
                  {featuredGuides.map((g) => (
                    <li key={g.id}>
                      <Link href={`/suburb-guides/${g.slug}`}>{g.slug.replace(/-/g, ' ')}</Link>
                      {g.states?.nodes?.[0] && <span className="muted">{g.states.nodes[0].name}</span>}
                    </li>
                  ))}
                </ul>
                <Link href={`/suburb-guides?state=${state}`} className="sidebar-view-all">View all &rarr;</Link>
              </div>
            )}

            {featuredAgencies.length > 0 && (
              <div className="sidebar-section">
                <h3>Agencies</h3>
                <ul className="sidebar-list">
                  {featuredAgencies.map((a) => (
                    <li key={a.id}>
                      <Link href={`/agencies/${a.slug}`}>{a.slug.replace(/-/g, ' ')}</Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/agencies?state=${state}`} className="sidebar-view-all">View all &rarr;</Link>
              </div>
            )}

            {featuredAgents.length > 0 && (
              <div className="sidebar-section">
                <h3>Agents</h3>
                <ul className="sidebar-list">
                  {featuredAgents.map((a) => (
                    <li key={a.id}>
                      <Link href={`/agents/${a.slug}`}>{a.slug.replace(/-/g, ' ')}</Link>
                      {a.agentProfile?.agency?.nodes?.[0] && (
                        <span className="muted">{a.agentProfile.agency.nodes[0].slug.replace(/-/g, ' ')}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <Link href={`/agents?state=${state}`} className="sidebar-view-all">View all &rarr;</Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
