import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS_BY_CATEGORY } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} — Real Estate News` };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const label = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  let posts: Post[] = [];
  try {
    const { data } = await apolloClient.query({
      query: GET_POSTS_BY_CATEGORY,
      variables: { category: slug, first: 50 },
    });
    posts = (data?.posts?.nodes ?? []) as Post[];
  } catch {
    posts = [];
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">{label}</h1>
        <div className="card-grid">
          {posts.map((post) => (
            <Link key={post.id} href={`/news/${post.slug}`} className="card">
              {post.featuredImage?.node?.sourceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText} />
              )}
              <div className="card-body">
                <h3>{post.title}</h3>
                <p className="muted">{formatDate(post.date)}</p>
              </div>
            </Link>
          ))}
          {posts.length === 0 && <p className="muted">No articles in this category yet.</p>}
        </div>
      </div>
    </section>
  );
}
