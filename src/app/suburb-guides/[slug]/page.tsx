import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_SUBURB_GUIDE } from '@/lib/graphql/queries';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function SuburbGuidePage({ params }: Props) {
  const { slug } = await params;
  const { data } = await apolloClient.query({ query: GET_SUBURB_GUIDE, variables: { slug } });

  if (!data.suburbGuideBy) notFound();
  const g = data.suburbGuideBy;

  return (
    <article className="article">
      <div className="container narrow">
        <div className="article-meta">
          {g.states?.nodes?.map((s: { name: string; slug: string }) => (
            <Link key={s.slug} href={`/state/${s.slug}`} className="tag">{s.name}</Link>
          ))}
          {g.suburbs?.nodes?.map((s: { name: string; slug: string }) => (
            <Link key={s.slug} href={`/suburb/${s.slug}`} className="tag">{s.name}</Link>
          ))}
        </div>
        <h1>{g.slug.replace(/-/g, ' ')}</h1>
        {g.featuredImage?.node?.sourceUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="article-hero" src={g.featuredImage.node.sourceUrl} alt={g.featuredImage.node.altText} />
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: g.content }} />
      </div>
    </article>
  );
}
