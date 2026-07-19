<?php
/**
 * Plugin Name: Aus Real Estate News MCP Server
 * Plugin URI: https://ausrealestatenews.com.au
 * Description: Configures the WordPress MCP Adapter to expose real estate content as MCP tools for AI agents.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * Requires Plugins: mcp-adapter
 * Author: Aus Real Estate News
 * Author URI: https://ausrealestatenews.com.au
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ausrealnews
 */

defined('ABSPATH') || exit;

define('AUSREALNEWS_MCP_VERSION', '1.0.0');
define('AUSREALNEWS_MCP_PLUGIN_DIR', plugin_dir_path(__FILE__));

// Require includes
require_once AUSREALNEWS_MCP_PLUGIN_DIR . 'includes/class-realestate-abilities.php';
require_once AUSREALNEWS_MCP_PLUGIN_DIR . 'includes/class-mcp-server-config.php';

// Initialize MCP Adapter on plugins_loaded
add_action('plugins_loaded', function () {
    if (!class_exists('WP\MCP\Core\McpAdapter')) {
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error"><p>';
            echo '<strong>Aus Real Estate News MCP Server</strong> requires the <strong>MCP Adapter</strong> plugin to be active.';
            echo '</p></div>';
        });
        return;
    }

    // Initialize the MCP Adapter singleton
    \WP\MCP\Core\McpAdapter::instance();
});

// Register ability category
add_action('wp_abilities_api_categories_init', ['AusRealNews_RealEstateAbilities', 'register_category']);

// Register abilities
add_action('wp_abilities_api_init', ['AusRealNews_RealEstateAbilities', 'register']);

// Create custom MCP server
add_action('mcp_adapter_init', ['AusRealNews_MCP_ServerConfig', 'create_server']);
