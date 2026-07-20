import { MetadataRoute } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_POSTS, GET_SUBURB_GUIDES, GET_AGENCIES, GET_AGENTS } from '@/lib/graphql/queries';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ausrealnews.com.au';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    const [{ data: postsData }, { data: guidesData }, { data: agenciesData }, { data: agentsData }] =
      await Promise.all([
        apolloClient.query({ query: GET_POSTS, variables: { first: 200 } }),
        apolloClient.query({ query: GET_SUBURB_GUIDES, variables: { first: 200 } }),
        apolloClient.query({ query: GET_AGENCIES, variables: { first: 200 } }),
        apolloClient.query({ query: GET_AGENTS, variables: { first: 200 } }),
      ]);

    const push = (slug: string, prefix: string, modified?: string) =>
      entries.push({
        url: `${BASE_URL}/${prefix}/${slug}`,
        lastModified: modified ? new Date(modified) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });

    postsData?.posts?.nodes?.forEach((p: { slug: string; modified?: string }) => push(p.slug, 'news', p.modified));
    guidesData?.suburbGuides?.nodes?.forEach((g: { slug: string; modified?: string }) => push(g.slug, 'suburb-guides', g.modified));
    agenciesData?.agencies?.nodes?.forEach((a: { slug: string; modified?: string }) => push(a.slug, 'agencies', a.modified));
    agentsData?.agents?.nodes?.forEach((a: { slug: string; modified?: string }) => push(a.slug, 'agents', a.modified));
  } catch {}

  entries.push(
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/suburb-guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/agencies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/agents`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  );

  return entries;
}
