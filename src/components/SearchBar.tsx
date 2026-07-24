'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        placeholder="Search news..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
