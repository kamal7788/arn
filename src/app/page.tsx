import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS, GET_CATEGORIES } from '@/lib/graphql/queries';
import type { Post, TaxonomyTerm } from '@/lib/types';

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
  return html.replace(/<[^>]+>/g, '').slice(0, 160);
}

function groupByCategory(posts: Post[], categories: TaxonomyTerm[]) {
  const groups: { category: TaxonomyTerm; posts: Post[] }[] = [];
  for (const cat of categories) {
    const matched = posts.filter((p) => p.categories?.nodes?.some((c) => c.slug === cat.slug));
    if (matched.length > 0) {
      groups.push({ category: cat, posts: matched });
    }
  }
  return groups;
}

function HeroArticle({ post }: { post: Post }) {
  return (
    <Link href={`/news/${post.slug}`} className="hp-hero">
      <div className="hp-hero-image">
        {post.featuredImage?.node?.sourceUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText || post.title} />
        ) : (
          <div className="hp-hero-fallback">AR</div>
        )}
      </div>
      <div className="hp-hero-body">
        {post.categories?.nodes?.[0] && (
          <span className="hp-category-label" data-cat={post.categories.nodes[0].slug}>
            {post.categories.nodes[0].name}
          </span>
        )}
        <h1 className="hp-hero-title">{post.title}</h1>
        <p className="hp-hero-excerpt">{stripHtml(post.excerpt)}</p>
        <span className="hp-date">{formatDate(post.date)}</span>
      </div>
    </Link>
  );
}

function CategorySection({ category, posts }: { category: TaxonomyTerm; posts: Post[] }) {
  return (
    <section className="hp-section">
      <div className="hp-section-header">
        <h2 className="hp-section-name">{category.name}</h2>
        <Link href={`/category/${category.slug}`} className="hp-view-more">View More</Link>
      </div>
      <div className="hp-section-grid">
        {posts.slice(0, 4).map((post, i) => (
          <Link key={post.id} href={`/news/${post.slug}`} className={`hp-card ${i === 0 ? 'hp-card-featured' : ''}`}>
            <div className="hp-card-image">
              {post.featuredImage?.node?.sourceUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText || post.title} />
              ) : (
                <div className="hp-card-fallback">AR</div>
              )}
            </div>
            <div className="hp-card-body">
              <h3 className="hp-card-title">{post.title}</h3>
              {i === 0 && <p className="hp-card-excerpt">{stripHtml(post.excerpt)}</p>}
              <span className="hp-date">{formatDate(post.date)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [{ data: postsData }, { data: catsData }] = await Promise.all([
    apolloClient.query({ query: GET_POSTS, variables: { first: 30 } }),
    apolloClient.query({ query: GET_CATEGORIES, variables: { first: 20 } }),
  ]);

  const posts = (postsData?.posts?.nodes ?? []) as Post[];
  const allCats = ((catsData?.categories?.nodes ?? []) as TaxonomyTerm[]).filter(
    (c) => c.slug !== 'uncategorized'
  );

  const hero = posts[0];
  const rest = posts.slice(1);
  const groups = groupByCategory(rest, allCats);

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <h2>No articles yet</h2>
        <p>Check back soon for the latest Australian real estate news.</p>
      </div>
    );
  }

  return (
    <div className="homepage container">
      {hero && <HeroArticle post={hero} />}
      {groups.map(({ category, posts: catPosts }) => (
        <CategorySection key={category.slug} category={category} posts={catPosts} />
      ))}
      {groups.length === 0 && rest.length > 0 && (
        <section className="hp-section">
          <div className="hp-section-header">
            <h2 className="hp-section-name">Latest News</h2>
          </div>
          <div className="hp-section-grid">
            {rest.slice(0, 4).map((post, i) => (
              <Link key={post.id} href={`/news/${post.slug}`} className={`hp-card ${i === 0 ? 'hp-card-featured' : ''}`}>
                <div className="hp-card-image">
                  {post.featuredImage?.node?.sourceUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText || post.title} />
                  ) : (
                    <div className="hp-card-fallback">AR</div>
                  )}
                </div>
                <div className="hp-card-body">
                  <h3 className="hp-card-title">{post.title}</h3>
                  {i === 0 && <p className="hp-card-excerpt">{stripHtml(post.excerpt)}</p>}
                  <span className="hp-date">{formatDate(post.date)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
