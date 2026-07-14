# AusRealNews — Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Agent / OpenCode                          │
│                    (MCP Client Application)                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ MCP Protocol (HTTP/JSON-RPC)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  WordPress MCP Server (HTTP Transport)              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    MCP Adapter Plugin                        │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │   │
│  │  │  Tools      │  │  Resources   │  │  Prompts           │  │   │
│  │  │             │  │              │  │                    │  │   │
│  │  │ list-posts  │  │ site-config  │  │ write-article      │  │   │
│  │  │ get-post    │  │              │  │ analyze-market     │  │   │
│  │  │ create-post │  │              │  │                    │  │   │
│  │  │ update-post │  │              │  │                    │  │   │
│  │  │ list-tax    │  │              │  │                    │  │   │
│  │  │ list-agents │  │              │  │                    │  │   │
│  │  │ get-agency  │  │              │  │                    │  │   │
│  │  └────────────┘  └──────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  WordPress Abilities API                      │   │
│  │  Custom Post Types · Taxonomies · ACF Fields · User Roles    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌──────────────┐  ┌─────────────────────┐  ┌──────────────┐
│   WPGraphQL  │  │   WordPress REST    │  │   n8n        │
│   Endpoint   │  │   API + Webhooks    │  │   Workflows  │
└──────┬───────┘  └─────────┬───────────┘  └──────┬───────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                           │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  App Router  │  │  API Routes  │  │  Apollo Client   │    │
│  │              │  │              │  │                  │    │
│  │  /           │  │ /revalidate  │  │  GraphQL Cache   │    │
│  │  /articles/* │  │ /agent/*     │  │  ISR Support     │    │
│  │  /category/* │  │ /admin/*     │  │                  │    │
│  │  /state/*    │  │              │  │                  │    │
│  │  /agent/*    │  │              │  │                  │    │
│  │  /admin/*    │  │              │  │                  │    │
│  │  /sitemap.ts │  │              │  │                  │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Design Decisions

### 1. Content Model

**CPTs**: `post` (general news), `market_report`, `suburb_guide`, `policy_update`, `agency`
- Chose CPT `agency` over taxonomy because agencies have rich metadata (description, website, social links) and need their own archive pages.
- `agency` is a CPT so it supports ACF field groups natively.

**Taxonomies**: `category` (native), `state`, `city`, `suburb`, `asset_class`
- `state` is non-hierarchical (flat) since all 8 states/territories are peers.
- `city`/`suburb` are non-hierarchical for flexibility.
- `asset_class` is hierarchical for future grouping (e.g., Residential > House).

**Agent model**: WordPress users with `agent_author` role + ACF user meta
- Agents are users (not CPTs) because they need login access to the dashboard.
- ACF user fields store profile data (headline, bio, service area, agency link).

### 2. MCP Adapter

- **Server name**: `ausrealnews-mcp` — namespaced and descriptive.
- **Transport**: HTTP (MCP 2025-11-25 compliant Streamable HTTP).
- **Auth**: API key via `X-MCP-API-Key` header, with WordPress capability fallback.
- **Abilities**: 8 tools registered via WordPress Abilities API with `mcp.public: true`.
- **Permissions**: Two-layer security (transport-level auth + per-ability capability checks).

### 3. Next.js Frontend

- **App Router**: Uses React Server Components for all data fetching.
- **ISR via API routes**: n8n calls `/api/revalidate` after WordPress publishes.
- **Apollo Client**: Client-side caching with `cache-and-network` policy.
- **TypeScript types**: Shared types for all GraphQL responses.

### 4. Data Flow

```
Content Creation:
  AI Agent → MCP Tools → WordPress (CPT + ACF) → WPGraphQL index
                                                           ↓
  n8n detects publish → calls /api/revalidate → Next.js ISR

Content Reading:
  User → Next.js (SSR) → WPGraphQL → WordPress DB
  AI Agent → MCP Tools → WordPress Abilities → WordPress DB
```

## File Structure

```
ausrealnews/
├── package.json                      # Next.js dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
├── .env.example                      # Environment variables
├── DEPLOYMENT.md                     # Hostinger deployment guide
├── ARCHITECTURE.md                   # This file
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with header/footer
│   │   ├── page.tsx                  # Homepage
│   │   ├── globals.css               # Global styles
│   │   ├── sitemap.ts                # Dynamic sitemap
│   │   │
│   │   ├── articles/[slug]/page.tsx  # Article detail pages
│   │   ├── category/[slug]/page.tsx  # Category hubs
│   │   ├── state/[state]/page.tsx    # State-based hubs
│   │   │
│   │   ├── agent/dashboard/page.tsx  # Agent dashboard
│   │   ├── admin/queue/page.tsx      # Editorial queue
│   │   │
│   │   └── api/
│   │       ├── revalidate/route.ts   # ISR revalidation endpoint
│   │       └── agent/
│   │           ├── topics/route.ts   # Agent topic submission
│   │           └── approve/route.ts  # Editorial approval
│   │
│   └── lib/
│       ├── types.ts                  # TypeScript interfaces
│       ├── apollo-client.ts          # Apollo Client setup
│       └── graphql/
│           └── queries.ts            # All GraphQL queries
│
├── wordpress/
│   ├── ausrealnews-content-model/    # WP plugin: CPTs, taxonomies, ACF
│   │   ├── ausrealnews-content-model.php
│   │   └── includes/
│   │       ├── class-post-types.php
│   │       ├── class-taxonomies.php
│   │       ├── class-acf-fields.php
│   │       ├── class-graphql-schema.php
│   │       └── class-roles.php
│   │
│   └── ausrealnews-mcp/              # WP plugin: MCP server setup
│       ├── ausrealnews-mcp.php
│       └── includes/
│           ├── class-realestate-abilities.php
│           └── class-mcp-server-config.php
│
└── mcp/
    ├── client-config.json            # MCP client connection config
    └── README.md                     # MCP setup instructions
```
