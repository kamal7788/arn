# WordPress Backend Setup Guide

Step-by-step guide for setting up the WordPress CMS backend using ACF Pro's admin UI.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| WordPress | 6.5+ |
| PHP | 8.1+ |
| MySQL | 8.0+ or MariaDB 10.4+ |
| HTTPS | Enabled |

---

## 1. Plugin Installation

Install and activate in this order:

| Order | Plugin | Source |
|-------|--------|--------|
| 1 | **WPGraphQL** | WordPress.org or [GitHub](https://github.com/wp-graphql/wp-graphql/releases) |
| 2 | **WPGraphQL for ACF** | [GitHub](https://github.com/wp-graphql/wp-graphql-acf) |
| 3 | **ACF Pro** | [advancedcustomfields.com](https://www.advancedcustomfields.com/) |
| 4 | **WordPress MCP Adapter** | [GitHub](https://github.com/WordPress/mcp-adapter/releases/latest/download/mcp-adapter.zip) |
| 5 | **Aus Real Estate News MCP Server** | Upload `wordpress/ausrealnews-mcp.zip` from this repo |

---

## 2. Create Custom Post Types

Go to **ACF → Post Types → Add New** and create each:

### Market Report

| Setting | Value |
|---------|-------|
| Post Type Label | Market Report |
| Post Type Key | `market_report` |
| Plural Label | Market Reports |
| Singular Label | Market Report |
| Has Archives | Yes |
| Show in REST API | Yes |
| Show in GraphQL | Yes |
| GraphQL Single Name | `marketReport` |
| GraphQL Plural Name | `marketReports` |

### Suburb Guide

| Setting | Value |
|---------|-------|
| Post Type Label | Suburb Guide |
| Post Type Key | `suburb_guide` |
| Plural Label | Suburb Guides |
| Singular Label | Suburb Guide |
| Has Archives | Yes |
| Show in REST API | Yes |
| Show in GraphQL | Yes |
| GraphQL Single Name | `suburbGuide` |
| GraphQL Plural Name | `suburbGuides` |

### Policy Update

| Setting | Value |
|---------|-------|
| Post Type Label | Policy Update |
| Post Type Key | `policy_update` |
| Plural Label | Policy Updates |
| Singular Label | Policy Update |
| Has Archives | Yes |
| Show in REST API | Yes |
| Show in GraphQL | Yes |
| GraphQL Single Name | `policyUpdate` |
| GraphQL Plural Name | `policyUpdates` |

### Agency

| Setting | Value |
|---------|-------|
| Post Type Label | Agency |
| Post Type Key | `agency` |
| Plural Label | Agencies |
| Singular Label | Agency |
| Has Archives | Yes |
| Show in REST API | Yes |
| Show in GraphQL | Yes |
| GraphQL Single Name | `agency` |
| GraphQL Plural Name | `agencies` |

---

## 3. Create Taxonomies

Go to **ACF → Taxonomies → Add New** and create each:

### State

| Setting | Value |
|---------|-------|
| Taxonomy Label | State |
| Taxonomy Key | `state` |
| Plural Label | States |
| Singular Label | State |
| Hierarchical | No |
| Show in REST API | Yes |
| Show in GraphQL | Yes |
| GraphQL Single Name | `State` |
| GraphQL Plural Name | `States` |
| Post Types | post, market_report, suburb_guide, policy_update |

### City

| Setting | Value |
|---------|-------|
| Taxonomy Label | City |
| Taxonomy Key | `city` |
| Plural Label | Cities |
| Singular Label | City |
| Hierarchical | No |
| Show in REST API | Yes |
| Show in GraphQL | Yes |
| GraphQL Single Name | `City` |
| GraphQL Plural Name | `Cities` |
| Post Types | post, market_report, suburb_guide |

### Suburb

| Setting | Value |
|---------|-------|
| Taxonomy Label | Suburb |
| Taxonomy Key | `suburb` |
| Plural Label | Suburbs |
| Singular Label | Suburb |
| Hierarchical | No |
| Show in REST API | Yes |
| Show in GraphQL | Yes |
| GraphQL Single Name | `Suburb` |
| GraphQL Plural Name | `Suburbs` |
| Post Types | post, market_report, suburb_guide |

### Asset Class

| Setting | Value |
|---------|-------|
| Taxonomy Label | Asset Class |
| Taxonomy Key | `asset_class` |
| Plural Label | Asset Classes |
| Singular Label | Asset Class |
| Hierarchical | Yes |
| Show in REST API | Yes |
| Show in GraphQL | Yes |
| GraphQL Single Name | `AssetClass` |
| GraphQL Plural Name | `AssetClasses` |
| Post Types | post, market_report, suburb_guide |

---

## 4. Create Field Groups

Go to **ACF → Field Groups → Add New** and create each:

### Field Group 1: Article Settings

**Location:** Post Type = post, suburb_guide, policy_update

| Field Label | Field Key | Type | Settings |
|-------------|-----------|------|----------|
| Source URLs | `source_urls` | URL | Allow Multiple: Yes |
| AI Pipeline ID | `ai_pipeline_id` | Text | — |
| Risk Level | `risk_level` | Select | Choices: Low, Medium, High |
| Is AI Generated | `is_ai_generated` | True/False | Default Value: false |

### Field Group 2: Market Report Fields

**Location:** Post Type = market_report

| Field Label | Field Key | Type | Settings |
|-------------|-----------|------|----------|
| Key Metrics | `key_metrics` | Group | — |
| — Median Price | `median_price` | Number | Min: 0, Required: Yes |
| — YoY Change | `yoy_change` | Number | Min: -100, Max: 100 |
| — Vacancy Rate | `vacancy_rate` | Number | Min: 0, Max: 100 |
| — Days on Market | `days_on_market` | Number | Min: 0 |
| Source URLs | `source_urls` | URL | Allow Multiple: Yes |
| Risk Level | `risk_level` | Select | Choices: Low, Medium, High |
| Is AI Generated | `is_ai_generated` | True/False | Default Value: false |

### Field Group 3: Agency Profile

**Location:** Post Type = agency

| Field Label | Field Key | Type | Settings |
|-------------|-----------|------|----------|
| Description | `description` | Textarea | — |
| Website | `website` | URL | — |
| Social Links | `social_links` | Group | — |
| — Facebook | `facebook` | URL | — |
| — Instagram | `instagram` | URL | — |
| — LinkedIn | `linkedin` | URL | — |

---

## 5. Create Categories

Go to **Posts → Categories → Add New** and create:

| Name | Slug |
|------|------|
| Market | `market` |
| Policy | `policy` |
| Development | `development` |
| Technology | `technology` |
| Finance | `finance` |

---

## 6. Create State Terms

Go to **Posts → States → Add New** and create:

| Name | Slug |
|------|------|
| New South Wales | `nsw` |
| Victoria | `vic` |
| Queensland | `qld` |
| Western Australia | `wa` |
| South Australia | `sa` |
| Tasmania | `tas` |
| Australian Capital Territory | `act` |
| Northern Territory | `nt` |

---

## 7. WPGraphQL Configuration

1. Go to **Settings → GraphQL**
2. Enable the GraphQL endpoint (default: `/graphql`)
3. Enable **Introspection** for development (disable in production)
4. Verify the endpoint:
   ```
   GET https://cms.ausrealestatenews.com.au/graphql?query={generalSettings{name,description,url}}
   ```

---

## 8. Verify GraphQL

Go to **GraphQL → GraphQL Explorer** and run:

```graphql
query {
  posts(first: 1) { nodes { title } }
  marketReports(first: 1) { nodes { title } }
  suburbGuides(first: 1) { nodes { title } }
  policyUpdates(first: 1) { nodes { title } }
  agencies(first: 1) { nodes { title } }
  states(first: 8) { nodes { name slug } }
  categories(first: 10) { nodes { name slug } }
}
```

---

## 9. Navigation Menu

Run the setup script to create the Primary Navigation menu:

```bash
# Via WP-CLI (SSH into WordPress host):
wp eval-file wp-setup-nav.php

# Or add to functions.php temporarily, visit any page, then remove.
```

The script creates:

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

**To update manually:** Go to **Appearance → Menus** and edit the "Primary Navigation" menu.

---

## 10. MCP Server Setup

### Generate API Key

```bash
wp eval 'echo AusRealNews_MCP_ServerConfig::generate_api_key();'
```

Save this key for the frontend `.env` file as `MCP_API_KEY`.

### Verify MCP Endpoint

```bash
curl -X POST https://cms.ausrealestatenews.com.au/wp-json/mcp/ausrealestate-news \
  -H "Content-Type: application/json" \
  -H "X-MCP-API-Key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

---

## 11. CORS Configuration

For the Next.js frontend to access WordPress, configure CORS.

### Option A: Plugin (Recommended)

Install **HTTP Headers** or **CORS Headers** plugin and add:

```
Access-Control-Allow-Origin: https://stg.ausrealestatenews.com.au
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-MCP-API-Key
Access-Control-Allow-Credentials: true
```

### Option B: .htaccess (Apache)

```apache
<IfModule mod_headers.c>
  SetEnvIf Origin "https://stg\.ausrealestatenews\.com\.au$" CORS_ORIGIN=$0
  Header set Access-Control-Allow-Origin "%{CORS_ORIGIN}e" env=CORS_ORIGIN
  Header set Access-Control-Allow-Methods "GET, POST, OPTIONS" env=CORS_ORIGIN
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-MCP-API-Key" env=CORS_ORIGIN
  Header set Access-Control-Allow-Credentials "true" env=CORS_ORIGIN
</IfModule>
```

---

## 12. Verification Checklist

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | WPGraphQL active | `Settings → GraphQL` page exists |
| 2 | GraphQL endpoint works | `GET /graphql?query={generalSettings{name}}` returns JSON |
| 3 | ACF Pro active | `ACF → Field Groups` shows your field groups |
| 4 | CPTs created | `ACF → Post Types` shows 4 CPTs |
| 5 | Taxonomies created | `ACF → Taxonomies` shows 4 taxonomies |
| 6 | Categories exist | `Posts → Categories` has Market, Policy, Development, Technology, Finance |
| 7 | State terms exist | `Posts → States` has all 8 states |
| 8 | MCP Adapter active | `/wp-json/mcp/mcp-adapter-default-server` responds |
| 9 | MCP API key generated | Saved in frontend `.env` |
| 10 | CORS configured | Frontend can fetch `/graphql` without errors |
| 11 | ACF fields in GraphQL | Query returns custom fields |
| 12 | Navigation menu | `Appearance → Menus` shows Primary Navigation |

---

## Files

| File | Purpose |
|------|---------|
| `wordpress/ausrealnews-mcp.zip` | MCP server plugin (upload to WordPress) |
| `wordpress/wp-setup-nav.php` | Script to create categories, states, and navigation menu |
| `SOURCE_OF_TRUTH.md` | Full project reference |
