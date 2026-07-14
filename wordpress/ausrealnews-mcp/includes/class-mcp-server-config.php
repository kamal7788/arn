<?php
/**
 * MCP Server configuration for Aus Real Estate News.
 *
 * Configures the MCP Adapter to create a dedicated server
 * with HTTP transport, exposing our custom abilities.
 */
class AusRealNews_MCP_ServerConfig {

    /**
     * Configure the MCP server on mcp_adapter_init hook.
     */
    public static function configure_server(): void {
        $adapter = \WP\MCP\Core\McpAdapter::instance();

        $server = $adapter->create_server('ausrealestate-news', [
            'label'       => 'Aus Real Estate News MCP Server',
            'description' => 'MCP server for Australian real estate news content management.',
            'transport'   => 'http',
            'transport_permission_callback' => function ($request) {
                $api_key = $request->get_header('X-MCP-API-Key');
                $valid_key = get_option('ausrealnews_mcp_api_key');

                if (empty($valid_key)) {
                    return current_user_can('read');
                }

                return $api_key === $valid_key;
            },
        ]);

        if (is_wp_error($server)) {
            error_log('AusRealNews MCP: Failed to create server - ' . $server->get_error_message());
            return;
        }

        // Register abilities as MCP tools
        $abilities = [
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
        ];

        foreach ($abilities as $ability_name) {
            $result = $server->register_tool($ability_name);
            if (is_wp_error($result)) {
                error_log("AusRealNews MCP: Failed to register tool {$ability_name} - " . $result->get_error_message());
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            add_filter('mcp_adapter_validation_enabled', '__return_true');
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            add_filter('mcp_adapter_observability_handler', function () {
                return new \WP\MCP\Infrastructure\Observability\ErrorLogMcpObservabilityHandler();
            });
        }

        error_log('AusRealNews MCP: Server configured successfully with ' . count($abilities) . ' tools.');
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
