# Navigation Menu — Setup & Maintenance Guide

## Menu Structure

```
Logo (→ /)
├── Market          → /category/market
├── Policy          → /category/policy
├── Development     → /category/development
├── State           → /state
│   ├── NSW         → /state/nsw
│   ├── VIC         → /state/vic
│   ├── QLD         → /state/qld
│   ├── WA          → /state/wa
│   ├── SA          → /state/sa
│   ├── TAS         → /state/tas
│   ├── ACT         → /state/act
│   └── NT          → /state/nt
├── Technology      → /category/technology
├── Finance         → /category/finance
└── 🔍 Search       → /search?q=<query>
```

## URL Patterns

| Route | Pattern | Source |
|-------|---------|--------|
| Homepage | `/` | Next.js `app/page.tsx` |
| Category hub | `/category/[slug]` | Next.js `app/category/[slug]/page.tsx` |
| State hub | `/state` | Next.js `app/state/page.tsx` |
| State listing | `/state/[state]` | Next.js `app/state/[state]/page.tsx` |
| Search | `/search?q=<query>` | Next.js `app/search/page.tsx` |
| Article | `/articles/[slug]` | Next.js `app/articles/[slug]/page.tsx` |

## WordPress Configuration

### Categories

These categories must exist in WordPress with exact slugs:

| Name | Slug | Used For |
|------|------|----------|
| Market | `market` | Property market news |
| Policy | `policy` | Regulation and policy news |
| Development | `development` | Development projects |
| Technology | `technology` | Proptech, AI, software |
| Finance | `finance` | Lending, rates, investment |

### State Taxonomy

The `state` taxonomy must be registered for posts and exposed via WPGraphQL.
Terms: `nsw`, `vic`, `qld`, `wa`, `sa`, `tas`, `act`, `nt`.

### Setup Script

Run `wordpress/wp-setup-nav.php` to auto-create:
1. All 5 categories
2. All 8 state terms
3. Primary navigation menu with correct structure
4. Assigns menu to theme location

```bash
# Via WP-CLI (SSH into WordPress host):
wp eval-file wp-setup-nav.php

# Or add to functions.php temporarily, visit any page, then remove.
```

## How to Update the Menu

### Option A: Next.js code (current approach)

Edit the `NAV_ITEMS` array in `src/components/Header.tsx`:

```typescript
const NAV_ITEMS = [
  { label: 'Market', href: '/category/market' },
  // ... add, remove, or reorder items here
];
```

State dropdown children are defined in the same file under the `State` item's `children` array.

**When to use:** Adding/removing/reordering nav items during development.

### Option B: WordPress menus (future)

The WP setup script creates the menu in WordPress. To fetch it headlessly:

1. Install the **WP GraphQL Nav Menus** plugin or use the REST API
2. Replace the static `NAV_ITEMS` with a GraphQL query in the Header component
3. The layout already fetches `generalSettings` — extend it to include menu data

**When to use:** When non-technical editors need to update navigation without code changes.

### Option C: WordPress REST API

```
GET /wp-json/wp/v2/menus/primary
```

Requires a menu plugin that exposes menus via REST (e.g., **WP REST API V2 Menus**).

## Domain Switching

To switch from staging to production:

1. Update environment variables in Hostinger hPanel:
   - `NEXT_PUBLIC_SITE_URL=https://ausrealestate.com.au`
   - `NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://cms.ausrealestatenews.com.au/graphql`
2. Update the WordPress site URL in **Settings → General**
3. No code changes needed — all URLs use `NEXT_PUBLIC_SITE_URL` or relative paths

## Files Changed

| File | Purpose |
|------|---------|
| `src/components/Header.tsx` | Nav component with dropdown and search |
| `src/app/layout.tsx` | Root layout using Header component |
| `src/app/globals.css` | Dropdown, search, and state grid styles |
| `src/app/state/page.tsx` | State hub page |
| `src/app/search/page.tsx` | Search results page |
| `src/lib/graphql/queries.ts` | Added `SEARCH_POSTS` query |
| `wordpress/wp-setup-nav.php` | WordPress setup script |
