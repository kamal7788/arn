<?php
/**
 * WP-CLI Setup Script: Create CPTs, Taxonomies, Field Groups, and Seed Data
 *
 * Run via SSH:
 *   wp eval-file wordpress/wp-setup-complete.php
 *
 * Or add to functions.php temporarily, visit any page, then remove.
 */

// ─── 1. CREATE CUSTOM POST TYPES ─────────────────────────────────────
$cpts = [
    'market_report' => [
        'label' => 'Market Reports',
        'singular' => 'Market Report',
        'graphql_single_name' => 'marketReport',
        'graphql_plural_name' => 'marketReports',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ],
    'suburb_guide' => [
        'label' => 'Suburb Guides',
        'singular' => 'Suburb Guide',
        'graphql_single_name' => 'suburbGuide',
        'graphql_plural_name' => 'suburbGuides',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ],
    'policy_update' => [
        'label' => 'Policy Updates',
        'singular' => 'Policy Update',
        'graphql_single_name' => 'policyUpdate',
        'graphql_plural_name' => 'policyUpdates',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
    ],
    'agency' => [
        'label' => 'Agencies',
        'singular' => 'Agency',
        'graphql_single_name' => 'agency',
        'graphql_plural_name' => 'agencies',
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
    ],
];

foreach ($cpts as $key => $args) {
    if (post_type_exists($key)) {
        error_log("CPT '{$key}' already exists.");
        continue;
    }

    $result = register_post_type($key, [
        'labels' => [
            'name'          => $args['label'],
            'singular_name' => $args['singular'],
            'add_new_item'  => 'Add New ' . $args['singular'],
            'edit_item'     => 'Edit ' . $args['singular'],
            'view_item'     => 'View ' . $args['singular'],
            'all_items'     => 'All ' . $args['label'],
            'search_items'  => 'Search ' . $args['label'],
            'menu_name'     => $args['label'],
        ],
        'public'             => true,
        'has_archive'        => true,
        'show_in_rest'       => true,
        'show_in_graphql'    => true,
        'graphql_single_name' => $args['graphql_single_name'],
        'graphql_plural_name' => $args['graphql_plural_name'],
        'supports'           => $args['supports'],
        'menu_icon'          => 'dashicons-admin-post',
        'rewrite'            => ['slug' => $key === 'agency' ? 'agencies' : str_replace('_', '-', $key)],
    ]);

    if (is_wp_error($result)) {
        error_log("CPT '{$key}' failed: " . $result->get_error_message());
    } else {
        error_log("CPT '{$key}' created.");
    }
}

// ─── 2. CREATE CUSTOM TAXONOMIES ──────────────────────────────────────
$taxonomies = [
    'state' => [
        'label' => 'States',
        'singular' => 'State',
        'graphql_single_name' => 'State',
        'graphql_plural_name' => 'States',
        'hierarchical' => false,
        'post_types' => ['post', 'market_report', 'suburb_guide', 'policy_update'],
    ],
    'city' => [
        'label' => 'Cities',
        'singular' => 'City',
        'graphql_single_name' => 'City',
        'graphql_plural_name' => 'Cities',
        'hierarchical' => false,
        'post_types' => ['post', 'market_report', 'suburb_guide'],
    ],
    'suburb' => [
        'label' => 'Suburbs',
        'singular' => 'Suburb',
        'graphql_single_name' => 'Suburb',
        'graphql_plural_name' => 'Suburbs',
        'hierarchical' => false,
        'post_types' => ['post', 'market_report', 'suburb_guide'],
    ],
    'asset_class' => [
        'label' => 'Asset Classes',
        'singular' => 'Asset Class',
        'graphql_single_name' => 'AssetClass',
        'graphql_plural_name' => 'AssetClasses',
        'hierarchical' => true,
        'post_types' => ['post', 'market_report', 'suburb_guide'],
    ],
];

foreach ($taxonomies as $key => $args) {
    if (taxonomy_exists($key)) {
        error_log("Taxonomy '{$key}' already exists.");
        continue;
    }

    $result = register_taxonomy($key, $args['post_types'], [
        'labels' => [
            'name'          => $args['label'],
            'singular_name' => $args['singular'],
            'add_new_item'  => 'Add New ' . $args['singular'],
            'edit_item'     => 'Edit ' . $args['singular'],
            'view_item'     => 'View ' . $args['singular'],
            'all_items'     => 'All ' . $args['label'],
            'search_items'  => 'Search ' . $args['label'],
            'menu_name'     => $args['label'],
        ],
        'hierarchical'      => $args['hierarchical'],
        'public'            => true,
        'show_in_rest'      => true,
        'show_in_graphql'   => true,
        'graphql_single_name' => $args['graphql_single_name'],
        'graphql_plural_name' => $args['graphql_plural_name'],
        'rewrite'           => ['slug' => $key],
    ]);

    if (is_wp_error($result)) {
        error_log("Taxonomy '{$key}' failed: " . $result->get_error_message());
    } else {
        error_log("Taxonomy '{$key}' created.");
    }
}

// ─── 3. SEED STATE TERMS ──────────────────────────────────────────────
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
            error_log("State '{$slug}' failed: " . $result->get_error_message());
        } else {
            error_log("State '{$name}' ({$slug}) created.");
        }
    } else {
        error_log("State '{$slug}' already exists.");
    }
}

// ─── 4. SEED ASSET CLASS TERMS ────────────────────────────────────────
$asset_classes = [
    'house'      => 'House',
    'unit'       => 'Unit',
    'townhouse'  => 'Townhouse',
    'commercial' => 'Commercial',
    'land'       => 'Land',
];

foreach ($asset_classes as $slug => $name) {
    if (!term_exists($slug, 'asset_class')) {
        $result = wp_insert_term($name, 'asset_class', ['slug' => $slug]);
        if (is_wp_error($result)) {
            error_log("Asset class '{$slug}' failed: " . $result->get_error_message());
        } else {
            error_log("Asset class '{$name}' ({$slug}) created.");
        }
    } else {
        error_log("Asset class '{$slug}' already exists.");
    }
}

// ─── 5. CREATE FIELD GROUPS (ACF) ─────────────────────────────────────
if (function_exists('acf_add_local_field_group')) {

    // Field Group 1: Article Settings
    acf_add_local_field_group([
        'key' => 'group_article_settings',
        'title' => 'Article Settings',
        'fields' => [
            [
                'key' => 'field_source_urls',
                'label' => 'Source URLs',
                'name' => 'source_urls',
                'type' => 'url',
                'instructions' => 'Research source URLs for this article.',
                'required' => 0,
                'multiple' => 1,
            ],
            [
                'key' => 'field_ai_pipeline_id',
                'label' => 'AI Pipeline ID',
                'name' => 'ai_pipeline_id',
                'type' => 'text',
                'instructions' => 'n8n workflow reference ID.',
                'required' => 0,
            ],
            [
                'key' => 'field_risk_level',
                'label' => 'Risk Level',
                'name' => 'risk_level',
                'type' => 'select',
                'choices' => [
                    'Low' => 'Low',
                    'Medium' => 'Medium',
                    'High' => 'High',
                ],
                'default_value' => 'Low',
                'required' => 0,
            ],
            [
                'key' => 'field_is_ai_generated',
                'label' => 'Is AI Generated',
                'name' => 'is_ai_generated',
                'type' => 'true_false',
                'default_value' => 0,
                'ui' => 1,
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'post',
                ],
            ],
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'suburb_guide',
                ],
            ],
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'policy_update',
                ],
            ],
        ],
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    // Field Group 2: Market Report Fields
    acf_add_local_field_group([
        'key' => 'group_market_report_fields',
        'title' => 'Market Report Fields',
        'fields' => [
            [
                'key' => 'field_key_metrics',
                'label' => 'Key Metrics',
                'name' => 'key_metrics',
                'type' => 'group',
                'layout' => 'table',
                'sub_fields' => [
                    [
                        'key' => 'field_median_price',
                        'label' => 'Median Price',
                        'name' => 'median_price',
                        'type' => 'number',
                        'required' => 1,
                        'min' => 0,
                        'prepend' => '$',
                    ],
                    [
                        'key' => 'field_yoy_change',
                        'label' => 'YoY Change (%)',
                        'name' => 'yoy_change',
                        'type' => 'number',
                        'min' => -100,
                        'max' => 100,
                        'append' => '%',
                    ],
                    [
                        'key' => 'field_vacancy_rate',
                        'label' => 'Vacancy Rate (%)',
                        'name' => 'vacancy_rate',
                        'type' => 'number',
                        'min' => 0,
                        'max' => 100,
                        'append' => '%',
                    ],
                    [
                        'key' => 'field_days_on_market',
                        'label' => 'Days on Market',
                        'name' => 'days_on_market',
                        'type' => 'number',
                        'min' => 0,
                        'append' => 'days',
                    ],
                ],
            ],
            [
                'key' => 'field_mr_source_urls',
                'label' => 'Source URLs',
                'name' => 'source_urls',
                'type' => 'url',
                'multiple' => 1,
            ],
            [
                'key' => 'field_mr_risk_level',
                'label' => 'Risk Level',
                'name' => 'risk_level',
                'type' => 'select',
                'choices' => [
                    'Low' => 'Low',
                    'Medium' => 'Medium',
                    'High' => 'High',
                ],
                'default_value' => 'Low',
            ],
            [
                'key' => 'field_mr_is_ai_generated',
                'label' => 'Is AI Generated',
                'name' => 'is_ai_generated',
                'type' => 'true_false',
                'default_value' => 0,
                'ui' => 1,
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'market_report',
                ],
            ],
        ],
        'style' => 'default',
        'active' => true,
    ]);

    // Field Group 3: Agency Profile
    acf_add_local_field_group([
        'key' => 'group_agency_profile',
        'title' => 'Agency Profile',
        'fields' => [
            [
                'key' => 'field_agency_description',
                'label' => 'Description',
                'name' => 'description',
                'type' => 'textarea',
            ],
            [
                'key' => 'field_agency_website',
                'label' => 'Website',
                'name' => 'website',
                'type' => 'url',
            ],
            [
                'key' => 'field_agency_social_links',
                'label' => 'Social Links',
                'name' => 'social_links',
                'type' => 'group',
                'layout' => 'table',
                'sub_fields' => [
                    [
                        'key' => 'field_facebook',
                        'label' => 'Facebook',
                        'name' => 'facebook',
                        'type' => 'url',
                    ],
                    [
                        'key' => 'field_instagram',
                        'label' => 'Instagram',
                        'name' => 'instagram',
                        'type' => 'url',
                    ],
                    [
                        'key' => 'field_linkedin',
                        'label' => 'LinkedIn',
                        'name' => 'linkedin',
                        'type' => 'url',
                    ],
                ],
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'agency',
                ],
            ],
        ],
        'style' => 'default',
        'active' => true,
    ]);

    error_log('ACF field groups created.');
} else {
    error_log('ACF Pro not active — skipping field group registration.');
}

// ─── 6. CREATE PRIMARY NAVIGATION MENU ────────────────────────────────
$menu_name = 'Primary Navigation';
$menu_exists = wp_get_nav_menu_object($menu_name);

if (!$menu_exists) {
    $menu_id = wp_create_nav_menu($menu_name);
    error_log("Menu '{$menu_name}' created with ID: {$menu_id}.");
} else {
    $menu_id = $menu_exists->term_id;
    error_log("Menu '{$menu_name}' already exists with ID: {$menu_id}.");
}

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
    }
    return $result;
}

// Clear existing menu items
$existing_items = wp_get_nav_menu_items($menu_name);
if ($existing_items) {
    foreach ($existing_items as $item) {
        wp_delete_post($item->ID, true);
    }
}

$site_url = get_site_url();
$order = 1;

arn_add_menu_item($menu_id, 'Market',      $site_url . '/category/market',      0, $order++);
arn_add_menu_item($menu_id, 'Policy',      $site_url . '/category/policy',      0, $order++);
arn_add_menu_item($menu_id, 'Development', $site_url . '/category/development', 0, $order++);

$state_parent_id = arn_add_menu_item($menu_id, 'State', $site_url . '/state', 0, $order++);

$state_children = [
    'NSW' => 'nsw', 'VIC' => 'vic', 'QLD' => 'qld', 'WA' => 'wa',
    'SA' => 'sa', 'TAS' => 'tas', 'ACT' => 'act', 'NT' => 'nt',
];

foreach ($state_children as $label => $slug) {
    arn_add_menu_item($menu_id, $label, $site_url . '/state/' . $slug, $state_parent_id, $order++);
}

arn_add_menu_item($menu_id, 'Technology',  $site_url . '/category/technology',  0, $order++);
arn_add_menu_item($menu_id, 'Finance',     $site_url . '/category/finance',     0, $order++);

// Assign menu to theme location
$locations = get_theme_mod('nav_menu_locations');
if (is_array($locations)) {
    $locations['primary'] = $menu_id;
} else {
    $locations = ['primary' => $menu_id];
}
set_theme_mod('nav_menu_locations', $locations);

error_log("✅ WordPress setup complete: CPTs, taxonomies, field groups, seed data, and navigation menu.");
