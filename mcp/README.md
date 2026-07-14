# MCP Server Configuration for OpenCode / Claude Desktop / AI Agent Clients

This file shows how to connect an MCP client to the WordPress MCP server.
Copy the relevant section into your MCP client configuration file.

## For Claude Desktop (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "ausrealestate-news": {
      "url": "https://cms.ausrealestatenews.com.au/mcp-server/",
      "transport": "http",
      "headers": {
        "X-MCP-API-Key": "YOUR_MCP_API_KEY_HERE"
      }
    }
  }
}
```

## For OpenCode / Generic MCP Client

```json
{
  "mcpServers": {
    "ausrealestate-news": {
      "command": null,
      "url": "https://cms.ausrealestatenews.com.au/mcp-server/",
      "transport": "streamable-http",
      "headers": {
        "X-MCP-API-Key": "YOUR_MCP_API_KEY_HERE"
      }
    }
  }
}
```

## Available MCP Tools

After connecting, you can discover tools via `tools/list` or use these directly:

### Content Management

| Tool Name | Description |
|-----------|-------------|
| `ausrealnews-list-posts` | List posts by type with taxonomy filters |
| `ausrealnews-get-post` | Get a single post by ID or slug |
| `ausrealnews-create-post` | Create a new article with content and metadata |
| `ausrealnews-update-post` | Update an existing post |
| `ausrealnews-list-taxonomies` | List taxonomy terms (states, cities, etc.) |
| `ausrealnews-list-agents` | List agent profiles |
| `ausrealnews-get-agency` | Get agency profile by ID or slug |
| `ausrealnews/list-market-reports` | List market reports with key metrics |

### Editorial Assistance

| Tool Name | Description | Permissions |
|-----------|-------------|-------------|
| `ausrealnews/get-editorial-queue` | Get draft/pending posts for review | editors/admins |
| `ausrealnews/summarize-article` | Generate article summary with key facts | editors/admins |
| `ausrealnews/suggest-headlines` | Generate headline suggestions (formal/casual/seo) | editors/admins |
| `ausrealnews/get-agent-articles` | List articles by a specific agent | editors/admins |

## Example AI Agent Prompts

Once connected, you can ask the AI agent:

- "Create a new market report about Sydney's housing market with median price $1.2M, YoY +8.3%, vacancy 1.2%, DOM 32 days"
- "List all draft articles for the NSW region"
- "Get the agency profile for Ray White Melbourne"
- "Update the risk level on post #1234 to High"
- "Get the editorial queue and summarize post #5678"
- "Suggest 5 SEO-heavy headlines for post #9012"
- "List all articles by agent #42"

## Authentication

The MCP server uses API key authentication via the `X-MCP-API-Key` header.
To generate a key:

1. Log in to WordPress admin
2. Go to Tools > Aus Real Estate News MCP Settings
3. Click "Generate API Key"
4. Copy the key and add it to your MCP client configuration

## Read-Only Mode

To restrict the server to read-only access (no create/update), add this
to your WordPress `wp-config.php`:

```php
define('AUSREALNEWS_MCP_READONLY', true);
```

Then update the transport permission callback in the MCP server config.
