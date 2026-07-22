import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS, GET_TAXONOMY_TERMS } from '@/lib/graphql/queries';
import { filterByAssetClass, bySlug } from '@/lib/filters';
import type { Post, TaxonomyTerm } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.replace(/-/g, ' ')} — Real Estate News` };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AssetClassPage({ params }: Props) {
  const { slug } = await params;
  const label = slug.replace(/-/g, ' ');

  const [{ data: postsData }, { data: termsData }] = await Promise.all([
    apolloClient.query({ query: GET_POSTS, variables: { first: 100 } }),
    apolloClient.query({ query: GET_TAXONOMY_TERMS, variables: { taxonomy: 'ASSET_CLASS' } }),
  ]);

  const posts = filterByAssetClass((postsData?.posts?.nodes ?? []) as Post[], slug);
  const term = bySlug((termsData?.terms?.nodes ?? []) as TaxonomyTerm[], slug);

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">{term?.name ?? label}</h1>
        <div className="card-grid">
          {posts.map((p) => (
            <Link key={p.id} href={`/news/${p.slug}`} className="card">
              <div className="card-body">
                <h3>{p.title}</h3>
                <p className="muted">{formatDate(p.date)}</p>
              </div>
            </Link>
          ))}
          {posts.length === 0 && <p className="muted">No articles for this asset class yet.</p>}
        </div>
      </div>
    </section>
  );
}
