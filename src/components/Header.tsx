import Link from 'next/link';
import { apolloClient } from '@/lib/apollo-client';
import { GET_CATEGORIES } from '@/lib/graphql/queries';
import SearchBar from '@/components/SearchBar';
import type { TaxonomyTerm } from '@/lib/types';

const STATE_LIST = [
  { slug: 'nsw', name: 'NSW' },
  { slug: 'vic', name: 'VIC' },
  { slug: 'qld', name: 'QLD' },
  { slug: 'wa', name: 'WA' },
  { slug: 'sa', name: 'SA' },
  { slug: 'tas', name: 'TAS' },
  { slug: 'act', name: 'ACT' },
  { slug: 'nt', name: 'NT' },
];

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
      <div className="container header-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">AR</span>
          <span className="logo-text">Aus Real Estate News</span>
        </Link>

        <nav className="main-nav" role="navigation" aria-label="Main navigation">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}>
              {cat.name}
            </Link>
          ))}
          <div className="nav-dropdown">
            <span className="nav-dropdown-trigger">
              States
              <svg className="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="nav-dropdown-menu">
              <Link href="/state" className="nav-dropdown-item nav-dropdown-all">All States</Link>
              {STATE_LIST.map((s) => (
                <Link key={s.slug} href={`/state/${s.slug}`} className="nav-dropdown-item">
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="header-actions">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
