import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { SEARCH_POSTS } from '@/lib/graphql/search';
import type { Post } from '@/lib/types';

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : 'Search',
    description: `Search results for "${q}" on Aus Real Estate News.`,
  };
}

async function searchPosts(query: string) {
  if (!query.trim()) return [];
  try {
    const { data } = await apolloClient.query({
      query: SEARCH_POSTS,
      variables: { search: query, first: 30 },
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

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const results = q ? await searchPosts(q) : [];

  return (
    <>
      <div className="search-page-header">
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>Search</h1>
        {q && (
          <p style={{ color: 'var(--ink-secondary)', marginTop: '0.5rem' }}>
            {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;<strong>{q}</strong>&rdquo;
          </p>
        )}
      </div>

      {!q && (
        <div className="empty-state">
          <h2>Enter a search term</h2>
          <p>Use the search bar in the header to find articles, suburbs, and reports.</p>
        </div>
      )}

      {q && results.length === 0 && (
        <div className="empty-state">
          <h2>No results found</h2>
          <p>Try different keywords or browse by category.</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/category/market" className="badge badge-category">Market</Link>
            <Link href="/category/policy" className="badge badge-category">Policy</Link>
            <Link href="/category/development" className="badge badge-category">Development</Link>
            <Link href="/category/technology" className="badge badge-category">Technology</Link>
            <Link href="/category/finance" className="badge badge-category">Finance</Link>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          {results.map((post) => (
            <Link key={post.id} href={`/news/${post.slug}`} className="search-result-card">
              <div className="search-result-content">
                <div className="search-result-meta">
                  {post.categories?.nodes?.map((cat) => (
                    <span key={cat.id} className="badge badge-category">{cat.name}</span>
                  ))}
                  {post.states?.nodes?.map((s) => (
                    <span key={s.id} className="badge badge-state">{s.name}</span>
                  ))}
                  <span className="meta">{formatDate(post.date)}</span>
                </div>
                <h3 dangerouslySetInnerHTML={{ __html: highlightMatch(post.title, q) }} />
                <p className="search-result-excerpt" dangerouslySetInnerHTML={{
                  __html: highlightMatch(post.excerpt.replace(/<[^>]+>/g, '').slice(0, 200), q)
                }} />
              </div>
              {post.featuredImage?.node && (
                <img src={post.featuredImage.node.sourceUrl} alt="" className="search-result-image" />
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
