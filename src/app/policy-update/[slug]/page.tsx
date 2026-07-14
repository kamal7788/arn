import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POST_BY_SLUG } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await apolloClient.query({
      query: GET_POST_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'no-cache',
    });
    if (!data.post) return {};
    return {
      title: data.post.title,
      description: `Policy update: ${data.post.title}`,
    };
  } catch {
    return {};
  }
}

export default async function PolicyUpdatePage({ params }: Props) {
  const { slug } = await params;
  let post: Post | null = null;

  try {
    const { data } = await apolloClient.query({
      query: GET_POST_BY_SLUG,
      variables: { slug },
      fetchPolicy: 'no-cache',
    });
    post = data.post;
  } catch {}

  if (!post) notFound();

  return (
    <article>
      <div className="badge" style={{ background: '#fefcbf', color: '#975a16', marginBottom: '1rem' }}>Policy Update</div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{post.title}</h1>
      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        {post.author.node.name} · {new Date(post.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
      <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
