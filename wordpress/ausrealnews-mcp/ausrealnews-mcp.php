<?php
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

// Require abilities registration
require_once AUSREALNEWS_MCP_PLUGIN_DIR . 'includes/class-realestate-abilities.php';
require_once AUSREALNEWS_MCP_PLUGIN_DIR . 'includes/class-mcp-server-config.php';

// Register abilities after MCP Adapter is initialized
add_action('mcp_adapter_init', ['AusRealNews_MCP_ServerConfig', 'configure_server'], 20);
add_action('wp_abilities_api_init', ['AusRealNews_RealEstateAbilities', 'register']);
add_action('wp_abilities_api_categories_init', ['AusRealNews_RealEstateAbilities', 'register_category']);
