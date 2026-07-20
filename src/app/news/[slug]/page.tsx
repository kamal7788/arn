import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POST } from '@/lib/graphql/queries';

type Props = { params: Promise<{ slug: string }> };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await apolloClient.query({ query: GET_POST, variables: { slug } });
    if (data.postBy) {
      return {
        title: data.postBy.title,
        description: (data.postBy.excerpt || '').replace(/<[^>]+>/g, '').slice(0, 160),
      };
    }
  } catch {}
  return { title: slug.replace(/-/g, ' ') };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const { data } = await apolloClient.query({ query: GET_POST, variables: { slug } });

  if (!data.postBy) notFound();
  const post = data.postBy;

  return (
    <article className="article">
      <div className="container narrow">
        <div className="article-meta">
          {post.categories?.nodes?.map((c: { name: string; slug: string }) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="tag">{c.name}</Link>
          ))}
          <span className="muted">{formatDate(post.date)}</span>
        </div>
        <h1>{post.title}</h1>
        {post.author?.node?.name && <p className="muted">By {post.author.node.name}</p>}
        {post.featuredImage?.node?.sourceUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="article-hero" src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText} />
        )}
        {post.states?.nodes?.length > 0 && (
          <p className="muted">
            State: {post.states.nodes.map((s: { name: string }) => s.name).join(', ')}
          </p>
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </article>
  );
}
