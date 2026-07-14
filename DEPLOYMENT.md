# Deployment Guide for Hostinger Node.js Apps

## Prerequisites

- Hostinger Business, Cloud, or VPS plan (Node.js support required)
- Node.js 18+ installed on the server
- WordPress installed on the same or separate Hostinger plan
- WPGraphQL + ACF Pro plugins installed on WordPress
- WordPress MCP Adapter plugin installed

## 1. Server Setup (Hostinger)

### Node.js App Configuration

In Hostinger control panel:
1. Go to **Advanced > Node.js**
2. Create a new Node.js application
3. Set:
   - **Node.js version**: 18+ (20 recommended)
   - **Application mode**: Production
   - **Application root**: `public_html/ausrealnews` (or your preferred path)
   - **Application URL**: your domain
   - **Application startup file**: `server.js` (not needed if using `npm start`)

### Environment Variables

Set these in the Hostinger Node.js panel or via `.env`:

```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://yourdomain.com.au/graphql
NEXT_PUBLIC_SITE_URL=https://yourdomain.com.au
WP_REST_BASE=https://yourdomain.com.au/wp-json
N8N_WEBHOOK_BASE=https://your-n8n.com/webhook
REVALIDATION_SECRET=<generate-a-strong-random-string>
MCP_SERVER_URL=https://yourdomain.com.au/wp-json/mcp/v1
MCP_SERVER_ID=com.ausrealnews.mcp
MCP_API_KEY=<from-wp-admin>
WP_APP_PASSWORD=<wordpress-application-password>
```

## 2. Deploy the Next.js App

### Option A: Git Deployment (Recommended)

```bash
# On your local machine
git init
git add .
git commit -m "Initial deploy"
git remote add production ssh://user@your-hostinger:port/path/to/app
git push production main
```

### Option B: Manual Upload

```bash
# Build locally first
npm install
npm run build

# Upload the entire project (excluding node_modules) to Hostinger
# Then SSH in and:
cd /path/to/app
npm install --production
npm start
```

### Build Scripts

The `package.json` has these scripts configured:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p ${PORT:-3000}",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

Hostinger will run `npm install` then `npm start` automatically if configured
through the Node.js panel. If using a custom setup, ensure you run:

```bash
npm install && npm run build && npm start
```

## 3. WordPress Setup

### Install Required Plugins

1. **WPGraphQL** — Install and activate
2. **ACF Pro** — Install and activate
3. **WordPress MCP Adapter** — Install from https://github.com/WordPress/mcp-adapter

### Deploy WordPress Plugins

Upload the two plugin directories to `wp-content/plugins/`:

```
wp-content/plugins/
├── ausrealnews-content-model/    # CPTs, taxonomies, ACF fields
│   ├── ausrealnews-content-model.php
│   └── includes/
├── ausrealnews-mcp/              # MCP server configuration
│   ├── ausrealnews-mcp.php
│   └── includes/
```

### Activate Plugins

1. Activate **AusRealNews Content Model** first
2. Activate **AusRealNews MCP Server** second
3. Go to WPGraphQL settings and ensure custom post types show in GraphQL

### Generate MCP API Key

In WordPress admin, go to Tools > AusRealNews MCP Settings (or run via WP-CLI):

```bash
wp eval 'echo AusRealNews_MCP_ServerConfig::generate_api_key();'
```

Copy the output key and store it securely.

## 4. Verify MCP Server

Test the MCP endpoint:

```bash
curl -X POST https://yourdomain.com.au/wp-json/mcp/v1/ausrealnews-mcp \
  -H "Content-Type: application/json" \
  -H "X-MCP-API-Key: YOUR_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-11-25",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0"}
    },
    "id": 1
  }'
```

You should receive a JSON-RPC response with server info and capabilities.

## 5. Configure n8n Webhooks

In your n8n instance, create webhooks:

1. **`/webhook/agent-topic`** — Receives agent topic submissions
2. **`/webhook/editorial-approve`** — Receives approval/rejection actions

Set the `N8N_WEBHOOK_BASE` environment variable to your n8n webhook base URL.

## 6. ISR Revalidation

After WordPress publishes content, trigger revalidation:

```bash
curl -X POST https://yourdomain.com.au/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidation-secret: YOUR_SECRET" \
  -d '{"slug": "article-slug", "type": "post"}'
```

Or use the n8n workflow to call this endpoint automatically on publish.

## 7. SSL and Domain

- Ensure SSL is active on both WordPress and Node.js apps
- If using a single domain with WordPress and Next.js:
  - WordPress at root or `/wp`
  - Next.js at root with WordPress proxied, OR
  - Use a subdomain for WordPress (e.g., `cms.yourdomain.com.au`)

## 8. Performance Notes

- **ISR**: Pages are regenerated on-demand after revalidation
- **Apollo Client**: Uses `cache-and-network` for freshness
- **Images**: Configure `remotePatterns` in `next.config.ts` for WordPress media
- **Caching**: Consider adding Redis/object cache on WordPress for MCP queries

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| GraphQL returns empty | Check WPGraphQL is active and CPTs are exposed |
| MCP server 401 | Verify API key in `X-MCP-API-Key` header |
| Build fails on Hostinger | Ensure Node.js 18+ and sufficient memory |
| ISR not working | Check `REVALIDATION_SECRET` matches |
| ACF fields missing | Activate ACF Pro and the content model plugin |
