# Aus Real Estate News — Source of Truth

> Single authoritative reference for architecture, content model, data contracts, conventions, and operational knowledge.

---

## 1. Project Overview

Aus Real Estate News is an Australian real estate news and market intelligence platform. It combines a **Next.js 15 frontend** with a **WordPress CMS backend**, integrated with AI agents via the **Model Context Protocol (MCP)** for automated content creation and management.

**Tagline:** AI-powered Australian real estate news, market reports, suburb guides, and policy updates.

---

## 2. Environments

| Environment | Frontend | WordPress CMS |
|-------------|----------|---------------|
| Staging | `https://stg.ausrealestatenews.com.au/` | `https://cms.ausrealestatenews.com.au/` |
| Production | `https://ausrealestate.com.au/` | `https://cms.ausrealestate.com.au/` |

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 15 |
| UI | React | 19 |
| Language | TypeScript | 5.6 |
| Data Fetching | Apollo Client | 3.11 |
| API Protocol | GraphQL (WPGraphQL) | — |
| CMS | WordPress | — |
| Custom Fields | ACF Pro | — |
| AI Integration | MCP (Model Context Protocol) | 2025-11-25 |
| Workflow Automation | n8n | — |
| Styling | Custom CSS (Inter + Playfair Display) | — |
| Deployment Target | Hostinger (Node.js) | — |

---

## 4. Architecture

### 4.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Agent / OpenCode                          │
│                    (MCP Client Application)                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ MCP Protocol (HTTP/JSON-RPC)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  WordPress MCP Server (HTTP Transport)              │
│                  Server ID: ausrealestate-news                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    MCP Adapter Plugin                        │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │   │
│  │  │  Tools      │  │  Resources   │  │  Prompts           │  │   │
│  │  │ list-posts  │  │ site-config  │  │ write-article      │  │   │
│  │  │ get-post    │  │              │  │ analyze-market     │  │   │
│  │  │ create-post │  │              │  │                    │  │   │
│  │  │ update-post │  │              │  │                    │  │   │
│  │  │ list-tax    │  │              │  │                    │  │   │
│  │  │ list-agents │  │              │  │                    │  │   │
│  │  │ get-agency  │  │              │  │                    │  │   │
│  │  │ editor-q    │  │              │  │                    │  │   │
│  │  │ summarize   │  │              │  │                    │  │   │
│  │  │ headlines   │  │              │  │                    │  │   │
│  │  │ agent-arts  │  │              │  │                    │  │   │
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
┌──────────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                                   │
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐            │
│  │  App Router  │  │  API Routes  │  │  Apollo Client   │            │
│  │              │  │              │  │                  │            │
│  │  /           │  │ /revalidate  │  │  GraphQL Cache   │            │
│  │  /articles/* │  │ /agent/*     │  │  ISR Support     │            │
│  │  /category/* │  │ /admin/*     │  │                  │            │
│  │  /state/*    │  │ /payments/*  │  │                  │            │
│  │  /agent/*    │  │ /editor/*    │  │                  │            │
│  │  /agency/*   │  │              │  │                  │            │
│  │  /admin/*    │  │              │  │                  │            │
│  │  /sitemap.ts │  │              │  │                  │            │
│  └─────────────┘  └──────────────┘  └──────────────────┘            │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flows

```
Content Creation:
  AI Agent → MCP Tools → WordPress (CPT + ACF) → WPGraphQL index
                                                           ↓
  n8n detects publish → calls /api/revalidate → Next.js ISR

Content Reading:
  User → Next.js (SSR) → WPGraphQL → WordPress DB
  AI Agent → MCP Tools → WordPress Abilities → WordPress DB

Agent Onboarding:
  Agent → Application Form → /api/agent/apply → n8n agent_vetting
  Editor → /admin/applications → approve → n8n creates WP user (agent_contributor)

Editorial Workflow:
  Agent → WordPress backend → create draft → status: draft
  Editor → /admin/queue → AI assist → /api/editor/send-to-ai → n8n
  Editor → approve/reject → /api/editor/workflows → n8n → WP REST → /api/revalidate
```

### 4.3 Design Decisions

| Decision | Rationale |
|----------|-----------|
| `agency` as CPT, not taxonomy | Agencies have rich metadata (description, website, social links) and need archive pages |
| `state` flat taxonomy | All 8 AU states/territories are peers, no hierarchy needed |
| `asset_class` hierarchical | Supports future grouping (e.g., Residential > House) |
| Agents as WordPress users | They need login access to the dashboard |
| `agent_contributor` role | Pays for access, can create/edit own posts but cannot publish |
| `editor_in_chief` role | Full editorial control without plugin/theme/user management |
| MCP over REST | Standard protocol for AI agent integration, supports tools/resources/prompts |
| ISR via n8n webhooks | Decoupled revalidation, no WordPress plugin needed for cache busting |
| Apollo Client `cache-and-network` | Freshness with offline fallback |

---

## 5. Content Model

### 5.1 Custom Post Types

| CPT | Slug | GraphQL Name | Description | Taxonomies |
|-----|------|-------------|-------------|------------|
| `post` | `post` | `Post` | General news articles | category, post_tag, state, city, suburb, asset_class |
| `market_report` | `market-report` | `marketReport` | Market analysis with key metrics | category, post_tag, state, city, suburb, asset_class |
| `suburb_guide` | `suburb-guide` | `suburbGuide` | Suburb-specific guides | category, post_tag, state, city, suburb, asset_class |
| `policy_update` | `policy-update` | `policyUpdate` | Government policy updates | category, post_tag, state |
| `agency` | `agency` | `agency` | Real estate agency profiles | — |

### 5.2 Taxonomies

| Taxonomy | Slug | GraphQL Name | Hierarchy | Seeded Terms |
|----------|------|-------------|-----------|--------------|
| `category` | `category` | `category` | Yes (native) | — |
| `post_tag` | `post_tag` | `postTag` | No (native) | — |
| `state` | `state` | `STATE` | No (flat) | NSW, VIC, QLD, WA, SA, TAS, ACT, NT |
| `city` | `city` | `CITY` | No | — |
| `suburb` | `suburb` | `SUBURB` | No | — |
| `asset_class` | `asset_class` | `ASSETCLASS` | Yes | House, Unit, Townhouse, Commercial, Land |

### 5.3 ACF Field Groups

#### Article Settings (posts, suburb_guides, policy_updates)

| Field | ACF Key | Type | Notes |
|-------|---------|------|-------|
| Source URLs | `source_urls` | `url` (multiple) | Research sources |
| AI Pipeline ID | `ai_pipeline_id` | `text` | n8n workflow ID |
| Risk Level | `risk_level` | `select` | Low / Medium / High |
| Is AI Generated | `is_ai_generated` | `true_false` | Content origin flag |

#### Market Report Fields (market_report)

| Field | ACF Key | Type | Notes |
|-------|---------|------|-------|
| Key Metrics | `key_metrics` | `group` | Nested fields below |
| — Median Price | `median_price` | `number` | AUD, min 0, required |
| — YoY Change | `yoy_change` | `number` | %, range -100 to 100 |
| — Vacancy Rate | `vacancy_rate` | `number` | %, range 0 to 100 |
| — Days on Market | `days_on_market` | `number` | Days, min 0 |
| Source URLs | `source_urls` | `url` (multiple) | Data sources |
| Risk Level | `risk_level` | `select` | Low / Medium / High |
| Is AI Generated | `is_ai_generated` | `true_false` | — |

#### Agent Profile (user role: agent_contributor)

| Field | ACF Key | Type | Notes |
|-------|---------|------|-------|
| Headline | `headline` | `text` | Required |
| Bio | `bio` | `textarea` | Required |
| Service Area | `service_area` | `text` | Geographic expertise |
| Agency | `agency_id` | `relationship` | Max 1, links to agency CPT |

#### Agency Profile (agency CPT)

| Field | ACF Key | Type | Notes |
|-------|---------|------|-------|
| Description | `description` | `textarea` | — |
| Website | `website` | `url` | — |
| Social Links | `social_links` | `group` | Nested fields below |
| — Facebook | `facebook` | `url` | — |
| — Instagram | `instagram` | `url` | — |
| — LinkedIn | `linkedin` | `url` | — |

### 5.4 User Roles

| Role | Capabilities |
|------|-------------|
| `administrator` | Full site control |
| `editor_in_chief` | edit_posts, edit_others_posts, publish_posts, delete_posts, delete_others_posts, manage_categories |
| `agent_contributor` | read, edit_posts, delete_posts, upload_files (cannot publish, edit others, or manage) |
| `subscriber` | read only |

---

## 6. TypeScript Types

All frontend types are defined in `src/lib/types.ts`.

```typescript
interface Post {
  id: string;
  databaseId: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  date: string;
  modified: string;
  status: string;
  featuredImage?: { node: { sourceUrl: string; altText: string } };
  author: { node: AgentProfile };
  categories: { nodes: Category[] };
  states: { nodes: TaxonomyTerm[] };
  cities: { nodes: TaxonomyTerm[] };
  suburbs: { nodes: TaxonomyTerm[] };
  assetClasses: { nodes: TaxonomyTerm[] };
  agency?: { node: AgencyProfile };
  acf: ArticleACF;
}

interface MarketReport extends Post {
  acf: MarketReportACF;
  keyMetrics?: {
    medianPrice: number;
    yoyChange: number;
    vacancyRate: number;
    daysOnMarket: number;
  };
}

interface ArticleACF {
  sourceUrls: string[];
  aiPipelineId: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  isAiGenerated: boolean;
}

interface MarketReportACF extends ArticleACF {
  keyMetrics: {
    medianPrice: number;
    yoyChange: number;
    vacancyRate: number;
    daysOnMarket: number;
  };
}

interface AgentProfile {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  avatar?: { url: string };
  acf: {
    headline: string;
    bio: string;
    serviceArea: string;
    agencyId: number;
  };
}

interface AgencyProfile {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  acf: {
    description: string;
    website: string;
    socialLinks: { facebook?: string; instagram?: string; linkedin?: string };
  };
}

interface Category { id: string; databaseId: number; name: string; slug: string; description: string; count: number }
interface TaxonomyTerm { id: string; databaseId: number; name: string; slug: string; count: number }
interface PageInfo { hasNextPage: boolean; endCursor: string }
interface PaginatedPosts { nodes: Post[]; pageInfo: PageInfo }
interface SiteInfo { name: string; description: string; url: string }
interface MenuNode { id: string; label: string; url: string; children?: { nodes: MenuNode[] } }

// New types
interface AgentApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseDetails: string;
  preferredAgency: string;
  paymentSessionId: string;
  planId: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  updatedAt: string;
}

interface EditorialDraft {
  postId: number;
  title: string;
  slug: string;
  status: string;
  type: string;
  agentId: number;
  agentName: string;
  createdAt: string;
  modifiedAt: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  isAiGenerated: boolean;
  aiPipelineId: string;
  aiSuggestions?: {
    summary?: string;
    headlines?: string[];
    seoSuggestions?: string[];
    factCheckNotes?: string[];
  };
}

interface EditorialQueueResponse {
  drafts: EditorialDraft[];
  total: number;
  pages: number;
}

interface AISuggestionResponse {
  success: boolean;
  suggestions: {
    summary?: string;
    headlines?: string[];
    seoSuggestions?: string[];
    factCheckNotes?: string[];
  };
}
```

---

## 7. GraphQL Queries

All queries are in `src/lib/graphql/queries.ts`.

| Query | Purpose | Variables |
|-------|---------|-----------|
| `POST_FIELDS` | Fragment: standard post fields | — |
| `MARKET_REPORT_FIELDS` | Fragment: post + key metrics ACF | — |
| `GET_POSTS` | List posts with pagination | `$first, $after, $where` |
| `GET_POST_BY_SLUG` | Single post by slug | `$slug: ID!` |
| `GET_MARKET_REPORTS` | List market reports | `$first, $after` |
| `GET_MARKET_REPORT_BY_SLUG` | Single market report by slug | `$slug: ID!` |
| `GET_CATEGORIES` | List all categories | `$first` |
| `GET_STATES` | List all states | `$first` |
| `GET_CITIES` | List cities (optional filter) | `$first, $where` |
| `GET_SUBURBS` | List suburbs (optional filter) | `$first, $where` |
| `GET_AGENT_POSTS` | Posts by author | `$authorId, $first, $status` |
| `GET_DRAFT_POSTS` | All draft posts | `$first` |
| `GET_SITE_INFO` | WordPress general settings | — |
| `GET_ALL_POST_SLUGS` | All slugs for sitemap | — |
| `GET_POSTS_BY_STATE` | Posts filtered by state | `$stateSlug, $first` |
| `GET_POSTS_BY_CATEGORY` | Posts filtered by category | `$categorySlug, $first` |
| `GET_POSTS_BY_SUBURB` | Posts filtered by suburb | `$suburbSlug, $first` |
| `GET_AGENCY_BY_SLUG` | Single agency by slug | `$slug: ID!` |
| `GET_AGENCIES` | List all agencies | `$first` |

---

## 8. MCP Tools

All tools are registered in `wordpress/ausrealnews-mcp/includes/class-realestate-abilities.php`.

### Content Management

| Tool | ID | Read/Write | Permission | Description |
|------|----|-----------|------------|-------------|
| List Posts | `ausrealnews/list-posts` | Read | `read` | List posts by type with taxonomy filters |
| Get Post | `ausrealnews/get-post` | Read | `read` | Get single post by ID or slug |
| Create Post | `ausrealnews/create-post` | Write | `publish_posts` | Create article with title, content, taxonomies, ACF |
| Update Post | `ausrealnews/update-post` | Write | `edit_posts` | Update existing post by ID |
| List Taxonomies | `ausrealnews/list-taxonomies` | Read | `read` | List taxonomy terms |
| List Agents | `ausrealnews/list-agents` | Read | `read` | List agent profiles |
| Get Agency | `ausrealnews/get-agency` | Read | `read` | Get agency profile by ID or slug |
| List Market Reports | `ausrealnews/list-market-reports` | Read | `read` | List market reports with key metrics |

### Editorial Assistance

| Tool | ID | Read/Write | Permission | Description |
|------|----|-----------|------------|-------------|
| Get Editorial Queue | `ausrealnews/get-editorial-queue` | Read | `edit_others_posts` | Get draft/pending posts for review |
| Summarize Article | `ausrealnews/summarize-article` | Read | `edit_others_posts` | Generate article summary with key facts |
| Suggest Headlines | `ausrealnews/suggest-headlines` | Read | `edit_others_posts` | Generate headline suggestions |
| Get Agent Articles | `ausrealnews/get-agent-articles` | Read | `edit_others_posts` | List articles by specific agent |

### MCP Authentication

- **Transport:** HTTP (MCP 2025-11-25 compliant Streamable HTTP)
- **Endpoint:** `https://cms.ausrealestatenews.com.au/mcp-server/`
- **Auth:** API key via `X-MCP-API-Key` header
- **Server ID:** `ausrealestate-news`

### Create Post Input Schema

```json
{
  "title": "string (required)",
  "content": "string (required, HTML)",
  "post_type": "post | market_report | suburb_guide | policy_update (default: post)",
  "status": "draft | publish (default: draft)",
  "categories": ["string"],
  "states": ["string"],
  "cities": ["string"],
  "suburbs": ["string"],
  "asset_classes": ["string"],
  "source_urls": ["string"],
  "ai_pipeline_id": "string",
  "risk_level": "Low | Medium | High (default: Low)",
  "is_ai_generated": "boolean (default: false)"
}
```

---

## 9. Frontend Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Homepage: hero, featured reports, latest articles |
| `/articles/[slug]` | `src/app/articles/[slug]/page.tsx` | Article detail |
| `/market-report/[slug]` | `src/app/market-report/[slug]/page.tsx` | Market report with key metrics |
| `/suburb-guide/[slug]` | `src/app/suburb-guide/[slug]/page.tsx` | Suburb guide detail |
| `/policy-update/[slug]` | `src/app/policy-update/[slug]/page.tsx` | Policy update detail |
| `/category/[slug]` | `src/app/category/[slug]/page.tsx` | Category hub |
| `/state/[state]` | `src/app/state/[state]/page.tsx` | State hub with suburb filters |
| `/state/[state]/[suburb]` | `src/app/state/[state]/page.tsx` | Suburb-specific listing |
| `/agent/[username]` | `src/app/agent/[username]/page.tsx` | Public agent profile |
| `/agency/[slug]` | `src/app/agency/[slug]/page.tsx` | Public agency profile |
| `/agent/dashboard` | `src/app/agent/dashboard/page.tsx` | Agent dashboard |
| `/admin/queue` | `src/app/admin/queue/page.tsx` | Editorial queue |
| `/admin/applications` | `src/app/admin/applications/page.tsx` | Agent application vetting |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/revalidate` | POST | ISR revalidation |
| `/api/agent/apply` | POST | Agent application submission → n8n |
| `/api/payments/webhook` | POST | Payment provider webhooks → n8n |
| `/api/editor/workflows` | GET | Editorial queue data |
| `/api/editor/send-to-ai` | POST | AI assistance requests → n8n |

---

## 10. File Structure

```
ausrealnews/
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.example
├── .gitignore
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── SOURCE_OF_TRUTH.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout: header, nav, footer
│   │   ├── page.tsx                          # Homepage
│   │   ├── globals.css                       # Global styles
│   │   ├── sitemap.ts                        # Dynamic sitemap
│   │   ├── articles/[slug]/page.tsx          # Article detail
│   │   ├── market-report/[slug]/page.tsx     # Market report detail
│   │   ├── suburb-guide/[slug]/page.tsx      # Suburb guide detail
│   │   ├── policy-update/[slug]/page.tsx     # Policy update detail
│   │   ├── category/[slug]/page.tsx          # Category hub
│   │   ├── state/[state]/page.tsx            # State + suburb hub
│   │   ├── agent/[username]/page.tsx         # Public agent profile
│   │   ├── agency/[slug]/page.tsx            # Public agency profile
│   │   ├── agent/dashboard/page.tsx          # Agent dashboard
│   │   ├── admin/queue/page.tsx              # Editorial queue
│   │   ├── admin/applications/page.tsx       # Agent applications
│   │   └── api/
│   │       ├── revalidate/route.ts           # ISR endpoint
│   │       ├── agent/apply/route.ts          # Agent application
│   │       ├── payments/webhook/route.ts     # Payment webhooks
│   │       ├── editor/workflows/route.ts     # Editorial data
│   │       └── editor/send-to-ai/route.ts    # AI assistance
│   │
│   └── lib/
│       ├── types.ts                          # TypeScript interfaces
│       ├── apollo-client.ts                  # Apollo Client setup
│       └── graphql/
│           └── queries.ts                    # All GraphQL queries
│
├── wordpress/
│   └── ausrealnews-mcp/                      # WP Plugin: MCP Server
│       ├── ausrealnews-mcp.php
│       └── includes/
│           ├── class-mcp-server-config.php   # MCP config (server: ausrealestate-news)
│           └── class-realestate-abilities.php # 12 MCP tools
│
└── mcp/
    ├── client-config.json                    # MCP client connection
    └── README.md                             # MCP setup instructions
```

---

## 11. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | Yes | WordPress WPGraphQL endpoint |
| `NEXT_PUBLIC_SITE_URL` | Yes | Frontend site URL |
| `WP_REST_BASE` | Yes | WordPress REST API base |
| `N8N_WEBHOOK_BASE` | Yes | n8n workflow webhook base URL |
| `REVALIDATION_SECRET` | Yes | Secret for ISR revalidation endpoint |
| `MCP_SERVER_URL` | Yes | MCP server endpoint |
| `MCP_SERVER_ID` | Yes | MCP server identifier (`ausrealestate-news`) |
| `MCP_API_KEY` | Yes | API key for MCP authentication |
| `WP_APP_PASSWORD` | Yes | WordPress application password |
| `NEXTAUTH_URL` | Yes | Auth base URL |
| `NODE_ENV` | Production | `production` |
| `PORT` | No | Server port (default: 3000) |

---

## 12. WordPress Plugin Setup

### Plugin Activation Order

1. **WPGraphQL** — GraphQL endpoint
2. **WPGraphQL for ACF** — Exposes ACF fields via GraphQL
3. **ACF Pro** — Custom fields, CPTs, and taxonomies (all managed via admin UI)
4. **WordPress MCP Adapter** — MCP server framework
5. **Aus Real Estate News MCP Server** — Custom MCP tools for AI agents

### Required WordPress Plugins

| Plugin | Source | Purpose |
|--------|--------|---------|
| WPGraphQL | WordPress.org | GraphQL endpoint at `/graphql` |
| WPGraphQL for ACF | [GitHub](https://github.com/wp-graphql/wp-graphql-acf) | Exposes ACF fields via GraphQL |
| ACF Pro | [advancedcustomfields.com](https://www.advancedcustomfields.com/) | CPTs, taxonomies, custom fields — all via admin UI |
| WordPress MCP Adapter | [GitHub](https://github.com/WordPress/mcp-adapter) | MCP server framework |
| Aus Real Estate News MCP Server | `wordpress/ausrealnews-mcp/` | 12 custom MCP tools for AI agents |

### Content Model (via ACF Pro UI)

All CPTs, taxonomies, and custom fields are created through the WordPress admin:

- **CPTs:** `ACF → Post Types → Add New`
- **Taxonomies:** `ACF → Taxonomies → Add New`
- **Field Groups:** `ACF → Field Groups → Add New`

No code-based plugins needed for content modeling.

### MCP API Key Generation

```bash
wp eval 'echo AusRealNews_MCP_ServerConfig::generate_api_key();'
```

---

## 13. Deployment

### Hostinger Setup

- Node.js 18+ (20 recommended)
- Application mode: Production
- Startup: `npm start` (runs `next start -p ${PORT:-3000}`)

### Build Process

```bash
npm install && npm run build && npm start
```

### Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type checking |

---

## 14. n8n Integration

### Webhooks

| Webhook | Purpose |
|---------|---------|
| `/webhook/agent-vetting` | Agent application vetting |
| `/webhook/payment-webhook` | Payment provider processing |
| `/webhook/editor-ai-assist` | Editorial AI assistance |

### Workflows

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `agent_vetting` | `/api/agent/apply`, `/api/payments/webhook` | Store application, notify editors, create WP user on approval |
| `editor_ai_assist` | `/api/editor/send-to-ai` | Fetch article, call LLM/MCP, return suggestions |
| `platform_content_pipeline` | Cron or manual | Fetch property APIs, generate drafts, store as pending |

---

## 15. Conventions

### Code Style

- TypeScript strict mode
- React Server Components by default
- CSS custom properties for theming
- Fonts: Inter (body), Playfair Display (headings)

### Naming

- CPT slugs: `snake_case` (e.g., `market_report`)
- GraphQL names: `camelCase` singular/plural
- ACF keys: `snake_case`
- Taxonomy slugs: `snake_case`
- File names: `kebab-case` for pages, `class-*.php` for WordPress classes

### Content Workflow

1. Agent creates content via WordPress backend → status: `draft`
2. Content appears in editorial queue (`/admin/queue`)
3. Editor uses AI assist for summaries/headlines
4. Editor approves/rejects → n8n webhook
5. On approval: post published, ISR triggered
6. Frontend serves fresh content

---

## 16. Troubleshooting

| Issue | Solution |
|-------|----------|
| GraphQL returns empty | Check WPGraphQL is active and CPTs are exposed |
| MCP server 401 | Verify API key in `X-MCP-API-Key` header |
| Build fails on Hostinger | Ensure Node.js 18+ and sufficient memory |
| ISR not working | Check `REVALIDATION_SECRET` matches |
| ACF fields missing | Verify field groups are created in ACF → Field Groups and attached to the correct post types |
| Posts not showing in GraphQL | Verify "Show in GraphQL" is enabled on the CPT in ACF → Post Types |
| Agent cannot publish | Expected: `agent_contributor` role lacks `publish_posts` capability |

---

## 17. WordPress Backend CMS Setup Guide

Complete step-by-step guide for setting up the WordPress backend on staging or production.

### 17.1 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| WordPress | 6.5+ | Latest stable |
| PHP | 8.1+ | Required by ACF Pro and WPGraphQL |
| MySQL | 8.0+ or MariaDB 10.4+ | |
| HTTPS | Enabled | Required for MCP and GraphQL |

### 17.2 Plugin Installation Order

Install and activate plugins in this exact order:

| Order | Plugin | Source | Purpose |
|-------|--------|--------|---------|
| 1 | **WPGraphQL** | WordPress.org or [GitHub releases](https://github.com/wp-graphql/wp-graphql/releases) | GraphQL endpoint at `/graphql` |
| 2 | **WPGraphQL for ACF** | [GitHub](https://github.com/wp-graphql/wp-graphql-acf) | Exposes ACF fields via GraphQL |
| 3 | **ACF Pro** | [Advanced Custom Fields Pro](https://www.advancedcustomfields.com/) | CPTs, taxonomies, custom fields — all via admin UI |
| 4 | **WordPress MCP Adapter** | [GitHub](https://github.com/WordPress/mcp-adapter/releases/latest/download/mcp-adapter.zip) | MCP server framework |
| 5 | **Aus Real Estate News — MCP Server** | `wordpress/ausrealnews-mcp/` (upload as zip) | 12 custom MCP tools for AI agents |

### 17.3 WPGraphQL Configuration

After activating WPGraphQL:

1. **Go to** `Settings → GraphQL` in WordPress admin
2. **Enable** the GraphQL endpoint (default: `/graphql`)
3. **Verify** the endpoint works:
   ```
   GET https://cms.ausrealestatenews.com.au/graphql?query={generalSettings{name,description,url}}
   ```
4. **Enable introspection** for development (disable in production):
   ```
   Settings → GraphQL → Enable Introspection: ON
   ```

#### Exposing Custom Post Types

ACF Pro automatically sets `show_in_graphql => true` on CPTs created via its UI. After creating your CPTs (see section 17.4), verify:

1. Go to `GraphQL → GraphQL Explorer` in WordPress admin
2. Run:
   ```graphql
   query {
     posts(first: 1) { nodes { title } }
     marketReports(first: 1) { nodes { title } }
     suburbGuides(first: 1) { nodes { title } }
     policyUpdates(first: 1) { nodes { title } }
     agencies(first: 1) { nodes { title } }
   }
   ```
3. All 5 types should return results (or empty arrays if no content yet)

#### Exposing Taxonomies

ACF Pro automatically sets `show_in_graphql => true` on taxonomies created via its UI. After creating your taxonomies (see section 17.4), verify:

```graphql
query {
  states(first: 8) { nodes { name slug } }
  assetClasses(first: 5) { nodes { name slug } }
}
```

### 17.4 ACF Pro — Create Content Model via Admin UI

All CPTs, taxonomies, and field groups are created through the ACF admin interface. No code required.

#### Step 1: Create Custom Post Types

Go to `ACF → Post Types → Add New` and create:

| Post Type Label | Post Type Key | Plural Label | Singular Label | Has Archives | Show in GraphQL |
|-----------------|---------------|--------------|----------------|--------------|-----------------|
| Market Report | `market_report` | Market Reports | Market Report | Yes | Yes |
| Suburb Guide | `suburb_guide` | Suburb Guides | Suburb Guide | Yes | Yes |
| Policy Update | `policy_update` | Policy Updates | Policy Update | Yes | Yes |
| Agency | `agency` | Agencies | Agency | Yes | Yes |

**Settings for each CPT:**
- Enable **Show in REST API** (required for block editor)
- Enable **Show in GraphQL** (required for frontend)
- Set **GraphQL Single Name** and **GraphQL Plural Name** (e.g., `marketReport` / `marketReports`)
- Enable **Archives** if you want archive pages

#### Step 2: Create Taxonomies

Go to `ACF → Taxonomies → Add New` and create:

| Taxonomy Label | Taxonomy Key | Plural Label | Singular Label | Hierarchical | Post Types | Show in GraphQL |
|----------------|--------------|--------------|----------------|--------------|------------|-----------------|
| State | `state` | States | State | No | post, market_report, suburb_guide, policy_update | Yes |
| City | `city` | Cities | City | No | post, market_report, suburb_guide | Yes |
| Suburb | `suburb` | Suburbs | Suburb | No | post, market_report, suburb_guide | Yes |
| Asset Class | `asset_class` | Asset Classes | Asset Class | Yes | post, market_report, suburb_guide | Yes |

**GraphQL Names:** Use singular capitalized names (e.g., `State`, `City`, `Suburb`, `AssetClass`)

#### Step 3: Create Field Groups

Go to `ACF → Field Groups → Add New` and create:

**Field Group 1: Article Settings**
- Location: Post Type = post, suburb_guide, policy_update
- Fields:

| Field Label | Field Key | Type | Notes |
|-------------|-----------|------|-------|
| Source URLs | `source_urls` | URL | Allow multiple values |
| AI Pipeline ID | `ai_pipeline_id` | Text | n8n workflow reference |
| Risk Level | `risk_level` | Select | Choices: Low, Medium, High |
| Is AI Generated | `is_ai_generated` | True/False | Default: false |

**Field Group 2: Market Report Fields**
- Location: Post Type = market_report
- Fields:

| Field Label | Field Key | Type | Notes |
|-------------|-----------|------|-------|
| Key Metrics | `key_metrics` | Group | Nested fields below |
| — Median Price | `median_price` | Number | Min 0, Required |
| — YoY Change | `yoy_change` | Number | %, range -100 to 100 |
| — Vacancy Rate | `vacancy_rate` | Number | %, range 0 to 100 |
| — Days on Market | `days_on_market` | Number | Min 0 |
| Source URLs | `source_urls` | URL | Allow multiple |
| Risk Level | `risk_level` | Select | Choices: Low, Medium, High |
| Is AI Generated | `is_ai_generated` | True/False | Default: false |

**Field Group 3: Agency Profile**
- Location: Post Type = agency
- Fields:

| Field Label | Field Key | Type | Notes |
|-------------|-----------|------|-------|
| Description | `description` | Textarea | |
| Website | `website` | URL | |
| Social Links | `social_links` | Group | Nested fields below |
| — Facebook | `facebook` | URL | |
| — Instagram | `instagram` | URL | |
| — LinkedIn | `linkedin` | URL | |

#### Step 4: Verify in GraphQL

After creating everything, test in the GraphQL Explorer:

```graphql
query {
  marketReports(first: 1) {
    nodes {
      title
      keyMetrics {
        medianPrice
        yoyChange
        vacancyRate
        daysOnMarket
      }
    }
  }
  states(first: 8) {
    nodes {
      name
      slug
    }
  }
}
```

### 17.5 Content Model Verification

#### Verify Custom Post Types

Go to `ACF → Post Types` and verify all 4 CPTs exist:

- Market Reports (`market_report`)
- Suburb Guides (`suburb_guide`)
- Policy Updates (`policy_update`)
- Agencies (`agency`)

Also check the admin menu for the corresponding menu items.

#### Verify Taxonomies

Go to `ACF → Taxonomies` and verify all 4 taxonomies exist:

- State (`state`)
- City (`city`)
- Suburb (`suburb`)
- Asset Class (`asset_class`)

Go to `Posts → Categories` (native) and add:

| Category | Slug |
|----------|------|
| Market | `market` |
| Policy | `policy` |
| Development | `development` |
| Technology | `technology` |
| Finance | `finance` |

#### Verify State Terms

Go to `Posts → States` and add all 8 Australian states/territories:

| State Name | Slug |
|------------|------|
| New South Wales | `nsw` |
| Victoria | `vic` |
| Queensland | `qld` |
| Western Australia | `wa` |
| South Australia | `sa` |
| Tasmania | `tas` |
| Australian Capital Territory | `act` |
| Northern Territory | `nt` |

### 17.6 Category and Taxonomy Seeding

Run the setup script to create all required categories and taxonomy terms:

```bash
# Option A: Via WP-CLI (SSH into WordPress host)
wp eval-file wp-setup-nav.php

# Option B: Add to functions.php temporarily
# Add the contents of wordpress/wp-setup-nav.php to your theme's functions.php
# Visit any page on the site
# Remove the code from functions.php
```

The script creates:

| Type | Terms Created |
|------|---------------|
| Categories | Market, Policy, Development, Technology, Finance |
| States | NSW, VIC, QLD, WA, SA, TAS, ACT, NT |
| Menu | Primary Navigation (with State dropdown) |

### 17.7 Navigation Menu Setup

The setup script (`wp-setup-nav.php`) creates the Primary Navigation menu with:

```
Market → /category/market
Policy → /category/policy
Development → /category/development
State → /state
  ├── NSW → /state/nsw
  ├── VIC → /state/vic
  ├── QLD → /state/qld
  ├── WA → /state/wa
  ├── SA → /state/sa
  ├── TAS → /state/tas
  ├── ACT → /state/act
  └── NT → /state/nt
Technology → /category/technology
Finance → /category/finance
```

**Menu location:** Assigned to `primary` theme location.

**To update the menu manually:**
1. Go to `Appearance → Menus`
2. Edit the "Primary Navigation" menu
3. Add/remove/reorder items
4. Ensure the State parent has child items for each state

### 17.8 MCP Adapter Setup

#### Install WordPress MCP Adapter

1. Download from [GitHub](https://github.com/WordPress/mcp-adapter)
2. Upload to `wp-content/plugins/wordpress-mcp-adapter`
3. Activate in WordPress admin

#### Install Aus Real Estate News MCP Plugin

1. Copy `wordpress/ausrealnews-mcp/` to `wp-content/plugins/ausrealnews-mcp`
2. Activate in WordPress admin

#### Generate MCP API Key

```bash
wp eval 'echo AusRealNews_MCP_ServerConfig::generate_api_key();'
```

Save this key — it's used in the frontend `.env` file as `MCP_API_KEY`.

#### MCP Server Configuration

The MCP server is configured with:

| Setting | Value |
|---------|-------|
| Transport | HTTP (Streamable HTTP) |
| Endpoint | `/mcp-server/` |
| Auth | API key via `X-MCP-API-Key` header |
| Server ID | `ausrealestate-news` |

#### Verify MCP Server

Test the MCP endpoint:

```bash
curl -X POST https://cms.ausrealestatenews.com.au/mcp-server/ \
  -H "Content-Type: application/json" \
  -H "X-MCP-API-Key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

Expected response: JSON with server capabilities.

### 17.9 GraphQL Testing

#### Test Queries

After all plugins are active, test these queries in the GraphQL Explorer (`/wp-admin/admin.php?page=graphql`):

**Test all post types:**
```graphql
query {
  posts(first: 5) { nodes { title slug date } }
  marketReports(first: 5) { nodes { title slug date } }
  suburbGuides(first: 5) { nodes { title slug date } }
  policyUpdates(first: 5) { nodes { title slug date } }
  agencies(first: 5) { nodes { title slug } }
}
```

**Test taxonomies:**
```graphql
query {
  categories(first: 10) { nodes { name slug count } }
  states(first: 10) { nodes { name slug count } }
  assetClasses(first: 10) { nodes { name slug count } }
}
```

**Test ACF fields (after creating a test post):**
```graphql
query {
  posts(first: 1) {
    nodes {
      title
      sourceUrls
      riskLevel
      isAiGenerated
    }
  }
}
```

**Test market report with key metrics:**
```graphql
query {
  marketReports(first: 1) {
    nodes {
      title
      keyMetrics {
        medianPrice
        yoyChange
        vacancyRate
        daysOnMarket
      }
    }
  }
}
```

### 17.10 CORS Configuration

For the Next.js frontend to access WordPress GraphQL and REST APIs, configure CORS:

#### Option A: WordPress Plugin (Recommended)

Install a CORS plugin like **HTTP Headers** or **CORS Headers** and add:

```
Access-Control-Allow-Origin: https://stg.ausrealestatenews.com.au
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-MCP-API-Key
Access-Control-Allow-Credentials: true
```

#### Option B: .htaccess (Apache)

Add to WordPress root `.htaccess`:

```apache
<IfModule mod_headers.c>
  SetEnvIf Origin "https://stg\.ausrealestatenews\.com\.au$" CORS_ORIGIN=$0
  Header set Access-Control-Allow-Origin "%{CORS_ORIGIN}e" env=CORS_ORIGIN
  Header set Access-Control-Allow-Methods "GET, POST, OPTIONS" env=CORS_ORIGIN
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-MCP-API-Key" env=CORS_ORIGIN
  Header set Access-Control-Allow-Credentials "true" env=CORS_ORIGIN
</IfModule>
```

#### Option C: nginx (if applicable)

```nginx
location /graphql {
  add_header Access-Control-Allow-Origin "https://stg.ausrealestatenews.com.au";
  add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
  add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-MCP-API-Key";
  add_header Access-Control-Allow-Credentials "true";
}
```

### 17.11 Headless WordPress Settings

Configure WordPress for headless operation:

#### Permalink Settings

Go to `Settings → Permalinks` and set:

- **Common Settings:** Custom Structure → `/%postname%/`
- This ensures clean URLs for GraphQL queries

#### Disable Frontend (Optional)

To redirect WordPress frontend to the Next.js app:

1. Install **Safe Redirect Manager** or **Redirection** plugin
2. Add redirect: `/*` → `https://stg.ausrealestatenews.com.au/$1` (301)
3. Exclude `/wp-admin/*` and `/wp-login.php` from redirect

#### Disable XML-RPC

Add to `functions.php` or a security plugin:

```php
add_filter('xmlrpc_enabled', '__return_false');
```

#### Disable WordPress REST API for Unauthorized Users (Optional)

For security, restrict REST API access:

```php
add_filter('rest_authentication_errors', function($result) {
    if (!is_user_logged_in() && !isset($_SERVER['HTTP_X_MCP_API_KEY'])) {
        return new WP_Error('rest_forbidden', 'Unauthorized', ['status' => 403]);
    }
    return $result;
});
```

### 17.12 Environment Variables (Frontend)

Update the frontend `.env` file with WordPress backend values:

```env
# WordPress GraphQL
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://cms.ausrealestatenews.com.au/graphql

# WordPress REST API
WP_REST_BASE=https://cms.ausrealestatenews.com.au/wp-json

# MCP Server
MCP_SERVER_URL=https://cms.ausrealestatenews.com.au/mcp-server/
MCP_SERVER_ID=ausrealestate-news
MCP_API_KEY=your_generated_api_key_here

# WordPress Application Password
WP_APP_PASSWORD=your_application_password_here

# Frontend
NEXT_PUBLIC_SITE_URL=https://stg.ausrealestatenews.com.au
```

### 17.13 Verification Checklist

After completing setup, verify each item:

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | WPGraphQL active | `Settings → GraphQL` page exists |
| 2 | GraphQL endpoint works | `GET /graphql?query={generalSettings{name}}` returns JSON |
| 3 | ACF Pro active | `ACF → Field Groups` shows 4 field groups |
| 4 | Content Model plugin active | Admin menu shows Market Reports, Suburb Guides, Policy Updates, Agencies |
| 5 | Taxonomies registered | `Posts → Categories` shows Market, Policy, Development, Technology, Finance; States show NSW, VIC, etc. |
| 6 | User roles created | `Users → Roles` shows editor_in_chief, agent_contributor |
| 7 | Categories seeded | Market, Policy, Development, Technology, Finance exist |
| 8 | State terms seeded | NSW, VIC, QLD, WA, SA, TAS, ACT, NT exist |
| 9 | Navigation menu created | `Appearance → Menus` shows Primary Navigation with correct structure |
| 10 | MCP Adapter active | `/mcp-server/` endpoint responds |
| 11 | MCP API key generated | Saved in frontend `.env` as `MCP_API_KEY` |
| 12 | CORS configured | Frontend can fetch `/graphql` without CORS errors |
| 13 | ACF fields in GraphQL | Query `posts { nodes { sourceUrls riskLevel } }` returns fields |
| 14 | Market report metrics | Query `marketReports { nodes { keyMetrics { medianPrice } } }` returns data |

---

## 18. Related Documentation

- `ARCHITECTURE.md` — Visual architecture and design decisions
- `DEPLOYMENT.md` — Step-by-step Hostinger deployment guide
- `mcp/README.md` — MCP client configuration and usage
- `docs/NAVIGATION.md` — Menu structure and maintenance guide
