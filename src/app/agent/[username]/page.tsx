import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_AGENT_POSTS } from '@/lib/graphql/queries';
import type { Post, AgentProfile } from '@/lib/types';

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} — Agent Profile` };
}

async function getAgentPosts(username: string) {
  try {
    const { data } = await apolloClient.query({
      query: GET_AGENT_POSTS,
      variables: { authorId: 0, first: 20, status: 'publish' },
      fetchPolicy: 'no-cache',
    });
    return data.posts.nodes as Post[];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AgentProfilePage({ params }: Props) {
  const { username } = await params;
  const posts = await getAgentPosts(username);

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Agent</p>
        <h1 style={{ fontSize: '2rem' }}>{username}</h1>
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
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No articles published by this agent yet.</p>
      )}
    </>
  );
}
