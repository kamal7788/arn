import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS_BY_STATE, GET_STATES } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

type Props = { params: Promise<{ state: string; suburb?: string }> };

const STATE_NAMES: Record<string, string> = {
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
  const { state, suburb } = await params;
  const stateName = STATE_NAMES[state]?.toUpperCase() || state.toUpperCase();
  const title = suburb
    ? `${suburb.charAt(0).toUpperCase() + suburb.slice(1)} — ${stateName} Real Estate`
    : `${stateName} — Real Estate News`;
  return { title };
}

async function getStatePosts(stateSlug: string) {
  try {
    const { data } = await apolloClient.query({
      query: GET_POSTS_BY_STATE,
      variables: { stateSlug, first: 50 },
      fetchPolicy: 'no-cache',
    });
    return data.posts.nodes as Post[];
  } catch {
    return [];
  }
}

async function getAllStates() {
  try {
    const { data } = await apolloClient.query({ query: GET_STATES, fetchPolicy: 'no-cache' });
    return data.states.nodes;
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const [posts, states] = await Promise.all([getStatePosts(state), getAllStates()]);
  const stateName = STATE_NAMES[state];
  if (!stateName) notFound();

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>State</p>
        <h1 style={{ fontSize: '2rem' }}>{stateName}</h1>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {states.map((s: { slug: string; name: string }) => (
          <Link
            key={s.slug}
            href={`/state/${s.slug}`}
            className="badge"
            style={s.slug === state ? { background: 'var(--color-primary)', color: 'white' } : {}}
          >
            {s.name}
          </Link>
        ))}
      </div>

      {posts.length > 0 ? (
        <div className="post-grid">
          {posts.map((post) => (
            <Link key={post.id} href={`/articles/${post.slug}`} className="post-card">
              {post.featuredImage?.node && (
                <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText} />
              )}
              <div className="post-card-body">
                <h3>{post.title}</h3>
                <div className="meta">{formatDate(post.date)}</div>
                <div style={{ marginTop: '0.5rem' }}>
                  {post.cities.nodes.map((city) => (
                    <span key={city.id} className="badge" style={{ marginRight: '0.25rem' }}>{city.name}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No articles for this state yet.</p>
      )}
    </>
  );
}
