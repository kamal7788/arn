import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS } from '@/lib/graphql/queries';
import type { Post } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Aus Real Estate News — Latest Australian Real Estate News',
  description:
    'Stay informed with the latest Australian real estate news, suburb guides, and agency directory.',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').slice(0, 180);
}

export default async function HomePage() {
  const { data } = await apolloClient.query({ query: GET_POSTS, variables: { first: 20 } });
  const posts = (data?.posts?.nodes ?? []) as Post[];
  const hero = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="news-listing">
      <div className="container">
        {hero && (
          <Link href={`/news/${hero.slug}`} className="news-hero">
            <div className="news-hero-image">
              {hero.featuredImage?.node?.sourceUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.featuredImage.node.sourceUrl} alt={hero.featuredImage.node.altText || hero.title} />
              ) : (
                <div className="news-hero-fallback">AR</div>
              )}
            </div>
            <div className="news-hero-body">
              {hero.categories?.nodes?.[0] && (
                <span className="tag">{hero.categories.nodes[0].name}</span>
              )}
              <h2>{hero.title}</h2>
              <p className="news-excerpt">{stripHtml(hero.excerpt)}</p>
              <span className="news-date">{formatDate(hero.date)}</span>
            </div>
          </Link>
        )}

        <div className="news-grid">
          {rest.map((post) => (
            <Link key={post.id} href={`/news/${post.slug}`} className="news-card">
              <div className="news-card-image">
                {post.featuredImage?.node?.sourceUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText || post.title} />
                ) : (
                  <div className="news-card-fallback">AR</div>
                )}
              </div>
              <div className="news-card-body">
                {post.categories?.nodes?.[0] && (
                  <span className="tag">{post.categories.nodes[0].name}</span>
                )}
                <h3>{post.title}</h3>
                <p className="news-excerpt">{stripHtml(post.excerpt)}</p>
                <span className="news-date">{formatDate(post.date)}</span>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="empty-state">
            <h2>No articles yet</h2>
            <p>Check back soon for the latest Australian real estate news.</p>
          </div>
        )}
      </div>
    </section>
  );
}
