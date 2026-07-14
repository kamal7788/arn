import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS_BY_CATEGORY, GET_CATEGORIES } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} — Real Estate News`,
  };
}

async function getCategoryPosts(slug: string) {
  try {
    const { data } = await apolloClient.query({
      query: GET_POSTS_BY_CATEGORY,
      variables: { categorySlug: slug, first: 50 },
      fetchPolicy: 'no-cache',
    });
    return data.posts.nodes as Post[];
  } catch {
    return [];
  }
}

async function getAllCategories() {
  try {
    const { data } = await apolloClient.query({
      query: GET_CATEGORIES,
      fetchPolicy: 'no-cache',
    });
    return data.categories.nodes;
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [posts, categories] = await Promise.all([getCategoryPosts(slug), getAllCategories()]);
  const category = categories.find((c: { slug: string }) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Category</p>
        <h1 style={{ fontSize: '2rem' }}>{category.name}</h1>
        {category.description && <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>{category.description}</p>}
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categories.map((cat: { id: string; slug: string; name: string }) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className={`badge ${cat.slug === slug ? 'btn-primary' : ''}`}
            style={cat.slug === slug ? { background: 'var(--color-primary)', color: 'white' } : {}}
          >
            {cat.name}
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
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No articles in this category yet.</p>
      )}
    </>
  );
}
