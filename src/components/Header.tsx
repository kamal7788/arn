import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_CATEGORIES } from '@/lib/graphql/queries';
import SearchBar from '@/components/SearchBar';
import StatesDropdown from '@/components/StatesDropdown';
import type { TaxonomyTerm } from '@/lib/types';

export default async function Header() {
  let categories: TaxonomyTerm[] = [];
  try {
    const { data } = await apolloClient.query({
      query: GET_CATEGORIES,
      variables: { first: 20 },
    });
    categories = ((data?.categories?.nodes ?? []) as TaxonomyTerm[]).filter(
      (c) => c.slug !== 'uncategorized'
    );
  } catch {
    categories = [];
  }

  return (
    <header className="header">
      <div className="container header-top">
        <Link href="/" className="logo">
          <span className="logo-dot">●</span> AR
        </Link>

        <SearchBar />
      </div>

      <nav className="category-nav" role="navigation" aria-label="Main navigation">
        <div className="category-nav-inner">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}>
              {cat.name}
            </Link>
          ))}
        </div>
        <StatesDropdown />
      </nav>
    </header>
  );
}
