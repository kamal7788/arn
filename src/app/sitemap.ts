import { MetadataRoute } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_ALL_POST_SLUGS } from '@/lib/graphql/queries';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ausrealnews.com.au';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    const { data } = await apolloClient.query({
      query: GET_ALL_POST_SLUGS,
      fetchPolicy: 'no-cache',
    });

    const buildEntry = (slug: string, date: string, modified: string, prefix: string) => ({
      url: `${BASE_URL}/${prefix}/${slug}`,
      lastModified: new Date(modified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    });

    if (data.posts?.nodes) {
      data.posts.nodes.forEach((p: { slug: string; date: string; modified: string }) =>
        entries.push(buildEntry(p.slug, p.date, p.modified, 'articles'))
      );
    }

    if (data.marketReports?.nodes) {
      data.marketReports.nodes.forEach((p: { slug: string; date: string; modified: string }) =>
        entries.push(buildEntry(p.slug, p.date, p.modified, 'market-report'))
      );
    }

    if (data.suburbGuides?.nodes) {
      data.suburbGuides.nodes.forEach((p: { slug: string; date: string; modified: string }) =>
        entries.push(buildEntry(p.slug, p.date, p.modified, 'suburb-guide'))
      );
    }

    if (data.policyUpdates?.nodes) {
      data.policyUpdates.nodes.forEach((p: { slug: string; date: string; modified: string }) =>
        entries.push(buildEntry(p.slug, p.date, p.modified, 'policy-update'))
      );
    }
  } catch {}

  // Static pages
  entries.push(
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/category/market`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/category/policy`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/category/development`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/state/nsw`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/state/vic`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/state/qld`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  );

  return entries;
}
