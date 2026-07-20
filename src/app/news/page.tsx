import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

export const metadata: Metadata = {
  title: 'News',
  description: 'Latest Australian real estate news and commentary.',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function NewsPage() {
  const { data } = await apolloClient.query({ query: GET_POSTS, variables: { first: 24 } });
  const posts = (data?.posts?.nodes ?? []) as Post[];

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">News</h1>
        <div className="card-grid">
          {posts.map((post) => (
            <Link key={post.id} href={post.uri} className="card">
              {post.featuredImage?.node?.sourceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText} />
              )}
              <div className="card-body">
                {post.categories?.nodes?.[0] && (
                  <span className="tag">{post.categories.nodes[0].name}</span>
                )}
                <h3>{post.title}</h3>
                <p className="muted">{formatDate(post.date)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
