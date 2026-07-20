import { Metadata } from 'next';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS, GET_SUBURB_GUIDES, GET_AGENCIES } from '@/lib/graphql/queries';
import type { Post, SuburbGuide, Agency } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Australian Real Estate News — Suburb Guides, Agencies & Market Commentary',
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

export default async function HomePage() {
  const [{ data: postsData }, { data: guidesData }, { data: agenciesData }] = await Promise.all([
    apolloClient.query({ query: GET_POSTS, variables: { first: 6 } }),
    apolloClient.query({ query: GET_SUBURB_GUIDES, variables: { first: 3 } }),
    apolloClient.query({ query: GET_AGENCIES, variables: { first: 4 } }),
  ]);

  const posts = (postsData?.posts?.nodes ?? []) as Post[];
  const guides = (guidesData?.suburbGuides?.nodes ?? []) as SuburbGuide[];
  const agencies = (agenciesData?.agencies?.nodes ?? []) as Agency[];

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Australian Real Estate News</h1>
          <p>Market intelligence, suburb guides, and an agency directory for the Australian property market.</p>
        </div>
      </section>

      <section className="section">
        <div className="container section-head">
          <h2>Latest News</h2>
          <Link href="/news" className="see-all">See all &rarr;</Link>
        </div>
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
      </section>

      <section className="section">
        <div className="container section-head">
          <h2>Suburb Guides</h2>
          <Link href="/suburb-guides" className="see-all">See all &rarr;</Link>
        </div>
        <div className="card-grid">
          {guides.map((g) => (
            <Link key={g.id} href={g.uri} className="card">
              <div className="card-body">
                <h3>{g.slug.replace(/-/g, ' ')}</h3>
                {g.states?.nodes?.[0] && <p className="muted">{g.states.nodes[0].name}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container section-head">
          <h2>Featured Agencies</h2>
          <Link href="/agencies" className="see-all">See all &rarr;</Link>
        </div>
        <div className="card-grid">
          {agencies.map((a) => (
            <Link key={a.id} href={a.uri} className="card">
              <div className="card-body">
                <h3>{a.slug.replace(/-/g, ' ')}</h3>
                {a.agencyProfile?.website && (
                  <p className="muted">{a.agencyProfile.website}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
