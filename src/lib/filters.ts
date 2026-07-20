import type { Post, SuburbGuide, Agency, Agent, TaxonomyTerm } from './types';

export function filterByTerm<T extends { states?: { nodes: TaxonomyTerm[] } }>(
  items: T[],
  slug: string
): T[] {
  return items.filter((item) => item.states?.nodes?.some((t) => t.slug === slug));
}

export function filterPostsByCategory(posts: Post[], slug: string): Post[] {
  return posts.filter((p) => p.categories?.nodes?.some((c) => c.slug === slug));
}

export function filterBySuburb<T extends { suburbs?: { nodes: TaxonomyTerm[] } }>(
  items: T[],
  slug: string
): T[] {
  return items.filter((item) => item.suburbs?.nodes?.some((t) => t.slug === slug));
}

export function filterByAssetClass(posts: Post[], slug: string): Post[] {
  return posts.filter((p) => p.assetClasses?.nodes?.some((c) => c.slug === slug));
}

export function bySlug(terms: TaxonomyTerm[], slug: string): TaxonomyTerm | undefined {
  return terms.find((t) => t.slug === slug);
}

export type { Post, SuburbGuide, Agency, Agent, TaxonomyTerm };
