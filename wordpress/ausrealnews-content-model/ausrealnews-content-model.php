<?php
/**
 * Plugin Name: Aus Real Estate News — Content Model
 * Plugin URI: https://ausrealestatenews.com.au
 * Description: Registers custom post types, taxonomies, ACF fields, and GraphQL schema for the Australian real estate news platform.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * Author: Aus Real Estate News
 * Author URI: https://ausrealestatenews.com.au
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ausrealnews
 */

defined('ABSPATH') || exit;

define('AUSREALNEWS_VERSION', '1.0.0');
define('AUSREALNEWS_PLUGIN_DIR', plugin_dir_path(__FILE__));

// Bootstrap
require_once AUSREALNEWS_PLUGIN_DIR . 'includes/class-post-types.php';
require_once AUSREALNEWS_PLUGIN_DIR . 'includes/class-taxonomies.php';
require_once AUSREALNEWS_PLUGIN_DIR . 'includes/class-acf-fields.php';
require_once AUSREALNEWS_PLUGIN_DIR . 'includes/class-graphql-schema.php';
require_once AUSREALNEWS_PLUGIN_DIR . 'includes/class-roles.php';

add_action('init', ['AusRealNews_PostTypes', 'register']);
add_action('init', ['AusRealNews_Taxonomies', 'register']);
add_action('acf/init', ['AusRealNews_ACF_Fields', 'register']);
add_action('init', ['AusRealNews_GraphQL_Schema', 'register']);
add_action('init', ['AusRealNews_Roles', 'register']);
