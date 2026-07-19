<?php
/**
 * MCP Server configuration for Aus Real Estate News.
 *
 * Creates a custom MCP server exposing real estate abilities as tools.
 */
class AusRealNews_MCP_ServerConfig {

    /**
     * Create the custom MCP server.
     *
     * @param object $adapter The McpAdapter instance.
     */
    public static function create_server($adapter): void {
        $adapter->create_server(
            'ausrealestate-news',                                          // Server ID
            'ausrealestate-news',                                          // REST API namespace
            'mcp',                                                         // REST API route
            'Aus Real Estate News MCP Server',                             // Server name
            'MCP server for Australian real estate news content management.', // Server description
            'v1.0.0',                                                      // Server version
            [                                                              // Transport methods
                \WP\MCP\Transport\HttpTransport::class,
            ],
            \WP\MCP\Infrastructure\ErrorHandling\ErrorLogMcpErrorHandler::class,
            \WP\MCP\Infrastructure\Observability\NullMcpObservabilityHandler::class,
            [                                                              // Abilities to expose as tools
                'ausrealnews/list-posts',
                'ausrealnews/get-post',
                'ausrealnews/create-post',
                'ausrealnews/update-post',
                'ausrealnews/list-taxonomies',
                'ausrealnews/list-agents',
                'ausrealnews/get-agency',
                'ausrealnews/list-market-reports',
                'ausrealnews/get-editorial-queue',
                'ausrealnews/summarize-article',
                'ausrealnews/suggest-headlines',
                'ausrealnews/get-agent-articles',
            ],
            [],                                                            // Resources (optional)
            [],                                                            // Prompts (optional)
        );

        error_log('AusRealNews MCP: Server created successfully with 12 tools.');
    }

    /**
     * Generate and store a new API key for MCP access.
     */
    public static function generate_api_key(): string {
        $key = bin2hex(random_bytes(32));
        update_option('ausrealnews_mcp_api_key', $key);
        return $key;
    }

    /**
     * Get the current API key.
     */
    public static function get_api_key(): string {
        return get_option('ausrealnews_mcp_api_key', '');
    }
}
