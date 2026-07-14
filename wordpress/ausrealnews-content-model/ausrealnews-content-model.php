/**
 * WordPress Plugin: AusRealNews Content Model
 *
 * Registers custom post types, taxonomies, and ACF fields
 * for the Australian real estate news platform.
 *
 * Install: Place in wp-content/plugins/ausrealnews-content-model/
 * Activate via WordPress admin.
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
