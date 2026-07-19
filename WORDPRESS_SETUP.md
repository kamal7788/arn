# WordPress Backend Setup Guide

## Step 1: Fresh WordPress Install

Install WordPress on your Hostinger hosting at `cms.ausrealestatenews.com.au`.

## Step 2: Install Required Plugins

Install and activate these **2 plugins** first:

| # | Plugin | Why |
|---|--------|-----|
| 1 | **WPGraphQL** | Provides the `/graphql` endpoint the frontend reads from |
| 2 | **ACF Pro** | Required for custom fields (the plugin uses `acf_add_local_field_group()`) |

Install WPGraphQL first, then ACF Pro. Activate each one.

## Step 3: Upload Custom Plugin

Copy this folder from this repo into `wp-content/plugins/`:

```
wp-content/plugins/
└── ausrealnews-content-model/    ← from wordpress/ folder in this repo
    ├── ausrealnews-content-model.php
    └── includes/
        ├── class-post-types.php
        ├── class-taxonomies.php
        ├── class-acf-fields.php
        ├── class-graphql-schema.php
        └── class-roles.php
```

## Step 4: Activate Plugin

Activate **Aus Real Estate News Content Model** in WordPress admin.

## What Gets Created Automatically

Once activated, the plugin registers everything:

### Custom Post Types (you do NOT create these manually)

| Post Type | Menu Label | Slug | What It's For |
|-----------|-----------|------|---------------|
| `market_report` | Market Reports | `/market-report/` | Market analysis with key metrics (median price, YoY, vacancy, DOM) |
| `suburb_guide` | Suburb Guides | `/suburb-guide/` | Suburb-specific guides |
| `policy_update` | Policy Updates | `/policy-update/` | Government policy updates |
| `agency` | Agencies | `/agency/` | Real estate agency profiles |

Plus the native WordPress `post` type for general news articles.

### Custom Taxonomies (you do NOT create these manually)

| Taxonomy | Attached To | Seeded Terms |
|----------|-------------|--------------|
| `state` | post, market_report, suburb_guide, policy_update | NSW, VIC, QLD, WA, SA, TAS, ACT, NT (all 8 auto-created) |
| `city` | post, market_report, suburb_guide | — (add as needed) |
| `suburb` | post, market_report, suburb_guide | — (add as needed) |
| `asset_class` | post, market_report | House, Unit, Townhouse, Commercial, Land (all 5 auto-created) |
| `post_tag` | market_report, suburb_guide, policy_update | — (native WordPress, just attached to CPTs) |
| `category` | post, market_report, suburb_guide, policy_update | — (native WordPress) |

### ACF Field Groups (you do NOT create these manually)

#### Article Settings — appears on posts, suburb guides, policy updates:

| Field | Type | Purpose |
|-------|------|---------|
| Source URLs | URL (multiple) | Research sources |
| AI Pipeline ID | Text | n8n workflow ID |
| Risk Level | Select (Low/Medium/High) | Content risk |
| Is AI Generated | True/False | Content origin flag |

#### Market Report Fields — appears on market reports:

| Field | Type | Purpose |
|-------|------|---------|
| Key Metrics > Median Price | Number | AUD, required |
| Key Metrics > YoY Change | Number | %, -100 to 100 |
| Key Metrics > Vacancy Rate | Number | %, 0 to 100 |
| Key Metrics > Days on Market | Number | Days |
| Source URLs | URL (multiple) | Data sources |
| Risk Level | Select | Low/Medium/High |
| Is AI Generated | True/False | — |

#### Agent Profile — appears on users with `agent_contributor` role:

| Field | Type | Purpose |
|-------|------|---------|
| Headline | Text | e.g., "Senior Property Analyst" |
| Bio | Textarea | Agent bio |
| Service Area | Text | Geographic expertise |
| Agency | Relationship (max 1) | Links to agency CPT |

#### Agency Profile — appears on agency CPT:

| Field | Type | Purpose |
|-------|------|---------|
| Description | Textarea | Agency description |
| Website | URL | — |
| Social Links > Facebook | URL | — |
| Social Links > Instagram | URL | — |
| Social Links > LinkedIn | URL | — |

### User Roles (you do NOT create these manually)

| Role | Capabilities |
|------|-------------|
| `editor_in_chief` | Full editorial control (edit, publish, delete own + others' posts, manage categories) |
| `agent_contributor` | Can edit/delete own posts, upload files. **Cannot** publish, edit others, or manage anything. |

### GraphQL Schema Extensions

The plugin also extends WPGraphQL with custom fields on Post, MarketReport, AgentAuthor, and Agency types — so `sourceUrls`, `aiPipelineId`, `riskLevel`, `isAiGenerated`, and `keyMetrics` are all queryable via GraphQL automatically.

## Step 5: Configure WPGraphQL

1. Go to **GraphQL > Settings** in WordPress admin
2. Ensure **Public Introspection** is enabled
3. Go to **GraphQL > IDE** and test this query:

```graphql
{
  posts(first: 5) {
    nodes {
      title
      slug
      date
    }
  }
  marketReports(first: 5) {
    nodes {
      title
      slug
      keyMetrics {
        medianPrice
        yoyChange
        vacancyRate
        daysOnMarket
      }
    }
  }
  states {
    nodes {
      name
      slug
    }
  }
  assetClasses {
    nodes {
      name
      slug
    }
  }
}
```

If that returns data, GraphQL is working.

## Step 6: Create Editor User

1. Go to **Users > Add New**
2. Create a user with role **Editor in Chief** (the custom role will appear in the role dropdown)
3. This user can publish, edit others' posts, and manage everything

## Step 7: Create Agent Users

When agents sign up via the application form:
1. Application goes to `/api/agent/apply` → n8n
2. You approve in `/admin/applications`
3. n8n creates a WordPress user with role **Agent Contributor** via WP REST API
4. Agent gets credentials and logs into WordPress at `cms.ausrealestatenews.com.au`

Or create test agents manually:
1. **Users > Add New**
2. Set role to **Agent Contributor**
3. After creation, edit the user profile — the ACF fields (Headline, Bio, Service Area, Agency) will appear

## Summary: What You Create vs What's Automatic

| What | Manual? | Where |
|------|---------|-------|
| WordPress install | Manual | Hostinger panel |
| WPGraphQL plugin | Manual | Plugin installer |
| ACF Pro plugin | Manual | Plugin installer |
| Content Model plugin | Manual upload | `wp-content/plugins/` |
| Custom post types | **Automatic** | Plugin creates on activation |
| Custom taxonomies | **Automatic** | Plugin creates on activation |
| ACF fields | **Automatic** | Plugin registers on activation |
| User roles | **Automatic** | Plugin creates on activation |
| State terms (NSW, VIC...) | **Automatic** | Plugin seeds on activation |
| Asset class terms | **Automatic** | Plugin seeds on activation |
| GraphQL schema extensions | **Automatic** | Plugin registers on activation |
| Editor user | Manual | WP admin > Users |
| Agent users | Manual or via n8n | WP admin or application flow |
