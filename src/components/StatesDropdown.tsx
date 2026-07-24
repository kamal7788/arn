'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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

export default function StatesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className={`nav-dropdown ${open ? 'open' : ''}`} ref={ref}>
      <button
        type="button"
        className="nav-dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        States
        <svg className="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="nav-dropdown-menu">
          <Link href="/state" className="nav-dropdown-item nav-dropdown-all" onClick={() => setOpen(false)}>
            All States
          </Link>
          {STATE_LIST.map((s) => (
            <Link key={s.slug} href={`/state/${s.slug}`} className="nav-dropdown-item" onClick={() => setOpen(false)}>
              {s.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
