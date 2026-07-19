'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Market', href: '/category/market' },
  { label: 'Policy', href: '/category/policy' },
  { label: 'Development', href: '/category/development' },
  {
    label: 'State',
    href: '/state',
    children: [
      { label: 'NSW', href: '/state/nsw' },
      { label: 'VIC', href: '/state/vic' },
      { label: 'QLD', href: '/state/qld' },
      { label: 'WA', href: '/state/wa' },
      { label: 'SA', href: '/state/sa' },
      { label: 'TAS', href: '/state/tas' },
      { label: 'ACT', href: '/state/act' },
      { label: 'NT', href: '/state/nt' },
    ],
  },
  { label: 'Technology', href: '/category/technology' },
  { label: 'Finance', href: '/category/finance' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  }

  return (
    <header className="header">
      <div className="container">
        {/* Logo */}
        <Link href="/" className="logo" onClick={() => setMobileOpen(false)}>
          <span className="logo-mark">AR</span>
          <span className="logo-text">Aus Real Estate News</span>
        </Link>

        {/* Desktop nav */}
        <nav className="main-nav" role="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="nav-dropdown">
                <Link href={item.href} className="nav-dropdown-trigger">
                  {item.label}
                  <svg className="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <div className="nav-dropdown-menu">
                  <Link href={item.href} className="nav-dropdown-item nav-dropdown-all">
                    All States
                  </Link>
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} className="nav-dropdown-item">
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right side: search + mobile toggle */}
        <div className="header-actions">
          <button
            className="search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle search"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            type="button"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <form className="search-bar" onClick={(e) => e.stopPropagation()} onSubmit={handleSearch}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search articles, suburbs, reports..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="mobile-nav-group">
                <Link href={item.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
                <div className="mobile-nav-children">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} className="mobile-nav-link mobile-nav-child" onClick={() => setMobileOpen(false)}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
