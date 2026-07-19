<?php
/**
 * WP-CLI Script: Create categories, menu, and verify taxonomy.
 *
 * Run via SSH on WordPress:
 *   wp eval-file wp-setup-nav.php
 *
 * Or add to functions.php temporarily and visit the site once,
 * then remove it.
 */

// ─── 1. CREATE CATEGORIES ────────────────────────────────────────────
$categories = [
    'Market'      => 'market',
    'Policy'      => 'policy',
    'Development' => 'development',
    'Technology'  => 'technology',
    'Finance'     => 'finance',
];

foreach ($categories as $name => $slug) {
    if (!term_exists($slug, 'category')) {
        $result = wp_insert_term($name, 'category', ['slug' => $slug]);
        if (is_wp_error($result)) {
            error_log("Category '{$slug}' creation failed: " . $result->get_error_message());
        } else {
            error_log("Category '{$name}' ({$slug}) created.");
        }
    } else {
        error_log("Category '{$slug}' already exists.");
    }
}

// ─── 2. VERIFY STATE TAXONOMY TERMS ─────────────────────────────────
$states = [
    'nsw' => 'New South Wales',
    'vic' => 'Victoria',
    'qld' => 'Queensland',
    'wa'  => 'Western Australia',
    'sa'  => 'South Australia',
    'tas' => 'Tasmania',
    'act' => 'Australian Capital Territory',
    'nt'  => 'Northern Territory',
];

foreach ($states as $slug => $name) {
    if (!term_exists($slug, 'state')) {
        $result = wp_insert_term($name, 'state', ['slug' => $slug]);
        if (is_wp_error($result)) {
            error_log("State '{$slug}' creation failed: " . $result->get_error_message());
        } else {
            error_log("State '{$name}' ({$slug}) created.");
        }
    } else {
        error_log("State '{$slug}' already exists.");
    }
}

// ─── 3. CREATE PRIMARY NAVIGATION MENU ──────────────────────────────
$menu_name = 'Primary Navigation';
$menu_exists = wp_get_nav_menu_object($menu_name);

if (!$menu_exists) {
    $menu_id = wp_create_nav_menu($menu_name);
    error_log("Menu '{$menu_name}' created with ID: {$menu_id}.");
} else {
    $menu_id = $menu_exists->term_id;
    error_log("Menu '{$menu_name}' already exists with ID: {$menu_id}.");
}

// Helper to add a menu item
function arn_add_menu_item($menu_id, $title, $url, $parent = 0, $order = 0) {
    $item = [
        'menu-item-title'     => $title,
        'menu-item-url'       => $url,
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-parent-id' => $parent,
        'menu-item-order'     => $order,
    ];
    $result = wp_update_nav_menu_item($menu_id, 0, $item);
    if (is_wp_error($result)) {
        error_log("Failed to add menu item '{$title}': " . $result->get_error_message());
    } else {
        error_log("Menu item '{$title}' added (ID: {$result}).");
    }
    return $result;
}

// Clear existing menu items first
$existing_items = wp_get_nav_menu_items($menu_name);
if ($existing_items) {
    foreach ($existing_items as $item) {
        wp_delete_post($item->ID, true);
    }
    error_log("Cleared existing menu items.");
}

$site_url = get_site_url();

// Add menu items in order
$order = 1;
arn_add_menu_item($menu_id, 'Market',      $site_url . '/category/market',      0, $order++);
arn_add_menu_item($menu_id, 'Policy',      $site_url . '/category/policy',      0, $order++);
arn_add_menu_item($menu_id, 'Development', $site_url . '/category/development', 0, $order++);

// State parent item
$state_parent_id = arn_add_menu_item($menu_id, 'State', $site_url . '/state', 0, $order++);

// State children
$state_children = [
    'NSW' => 'nsw',
    'VIC' => 'vic',
    'QLD' => 'qld',
    'WA'  => 'wa',
    'SA'  => 'sa',
    'TAS' => 'tas',
    'ACT' => 'act',
    'NT'  => 'nt',
];

foreach ($state_children as $label => $slug) {
    arn_add_menu_item($menu_id, $label, $site_url . '/state/' . $slug, $state_parent_id, $order++);
}

arn_add_menu_item($menu_id, 'Technology',  $site_url . '/category/technology',  0, $order++);
arn_add_menu_item($menu_id, 'Finance',     $site_url . '/category/finance',     0, $order++);

// ─── 4. ASSIGN MENU TO THEME LOCATION ───────────────────────────────
// For classic themes:
$locations = get_theme_mod('nav_menu_locations');
if (is_array($locations)) {
    $locations['primary'] = $menu_id;
} else {
    $locations = ['primary' => $menu_id];
}
set_theme_mod('nav_menu_locations', $locations);
error_log("Menu assigned to 'primary' theme location.");

error_log("✅ WordPress nav setup complete.");
