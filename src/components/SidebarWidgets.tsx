import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS, GET_AGENCIES, GET_AGENTS, GET_SUBURB_GUIDES } from '@/lib/graphql/queries';
import type { Post, Agency, Agent, SuburbGuide } from '@/lib/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function SidebarWidgets() {
  const [{ data: postsData }, { data: agenciesData }, { data: agentsData }, { data: guidesData }] =
    await Promise.all([
      apolloClient.query({ query: GET_POSTS, variables: { first: 5 } }),
      apolloClient.query({ query: GET_AGENCIES, variables: { first: 5 } }),
      apolloClient.query({ query: GET_AGENTS, variables: { first: 5 } }),
      apolloClient.query({ query: GET_SUBURB_GUIDES, variables: { first: 5 } }),
    ]);

  const posts = (postsData?.posts?.nodes ?? []) as Post[];
  const agencies = (agenciesData?.agencies?.nodes ?? []) as Agency[];
  const agents = (agentsData?.agents?.nodes ?? []) as Agent[];
  const guides = (guidesData?.suburbGuides?.nodes ?? []) as SuburbGuide[];

  return (
    <aside className="homepage-sidebar">
      {/* Featured News */}
      {posts.length > 0 && (
        <div className="widgets-section">
          <h3 className="widgets-section-title">Featured News</h3>
          <div>
            {posts.map((post) => (
              <div key={post.id} className="widget-news-card">
                {post.featuredImage?.node?.sourceUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.featuredImage.node.sourceUrl} alt="" className="widget-news-img" />
                ) : (
                  <div className="widget-news-img-fallback" />
                )}
                <div className="widget-news-body">
                  <Link href={`/news/${post.slug}`}>{post.title}</Link>
                  <p className="muted">{formatDate(post.date)}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/" className="widgets-view-all">View all news &rarr;</Link>
        </div>
      )}

      {/* Featured Agencies */}
      {agencies.length > 0 && (
        <div className="widgets-section">
          <h3 className="widgets-section-title">Agencies</h3>
          <ul className="widgets-list">
            {agencies.map((a) => (
              <li key={a.id}>
                <Link href={`/agencies/${a.slug}`}>{a.slug.replace(/-/g, ' ')}</Link>
                {a.states?.nodes?.[0] && <span className="muted">{a.states.nodes[0].name}</span>}
              </li>
            ))}
          </ul>
          <Link href="/agencies" className="widgets-view-all">View all agencies &rarr;</Link>
        </div>
      )}

      {/* Featured Agents */}
      {agents.length > 0 && (
        <div className="widgets-section">
          <h3 className="widgets-section-title">Agents</h3>
          <ul className="widgets-list">
            {agents.map((a) => (
              <li key={a.id}>
                <Link href={`/agents/${a.slug}`}>{a.slug.replace(/-/g, ' ')}</Link>
                {a.agentProfile?.agency?.nodes?.[0] && (
                  <span className="muted">{a.agentProfile.agency.nodes[0].slug.replace(/-/g, ' ')}</span>
                )}
              </li>
            ))}
          </ul>
          <Link href="/agents" className="widgets-view-all">View all agents &rarr;</Link>
        </div>
      )}

      {/* Suburb Guides */}
      {guides.length > 0 && (
        <div className="widgets-section">
          <h3 className="widgets-section-title">Suburb Guides</h3>
          <ul className="widgets-list">
            {guides.map((g) => (
              <li key={g.id}>
                <Link href={`/suburb-guides/${g.slug}`}>{g.slug.replace(/-/g, ' ')}</Link>
                {g.states?.nodes?.[0] && <span className="muted">{g.states.nodes[0].name}</span>}
              </li>
            ))}
          </ul>
          <Link href="/suburb-guides" className="widgets-view-all">View all guides &rarr;</Link>
        </div>
      )}
    </aside>
  );
}
