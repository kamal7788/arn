<?php
/**
 * WP-CLI Setup Script: Create CPTs, Taxonomies, Field Groups, and Seed Data
 *
 * Run via SSH:
 *   wp eval-file wp-setup-complete.php
 *
 * CRITICAL: register_post_type and register_taxonomy MUST be called on 'init' hook.
 */

// ─── 1. REGISTER CPTs ON INIT ────────────────────────────────────────
add_action('init', function () {
    $cpts = [
        'market_report' => [
            'label' => 'Market Reports',
            'singular' => 'Market Report',
            'graphql_single_name' => 'marketReport',
            'graphql_plural_name' => 'marketReports',
        ],
        'suburb_guide' => [
            'label' => 'Suburb Guides',
            'singular' => 'Suburb Guide',
            'graphql_single_name' => 'suburbGuide',
            'graphql_plural_name' => 'suburbGuides',
        ],
        'policy_update' => [
            'label' => 'Policy Updates',
            'singular' => 'Policy Update',
            'graphql_single_name' => 'policyUpdate',
            'graphql_plural_name' => 'policyUpdates',
        ],
        'agency' => [
            'label' => 'Agencies',
            'singular' => 'Agency',
            'graphql_single_name' => 'agency',
            'graphql_plural_name' => 'agencies',
        ],
    ];

    foreach ($cpts as $key => $args) {
        if (post_type_exists($key)) {
            error_log("CPT '{$key}' already exists.");
            continue;
        }

        register_post_type($key, [
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
            'supports'           => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'menu_icon'          => 'dashicons-admin-post',
            'rewrite'            => ['slug' => $key === 'agency' ? 'agencies' : str_replace('_', '-', $key)],
        ]);

        error_log("CPT '{$key}' registered.");
    }

    // ─── 2. REGISTER TAXONOMIES ON INIT ──────────────────────────────
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

        register_taxonomy($key, $args['post_types'], [
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

        error_log("Taxonomy '{$key}' registered.");
    }
});

// ─── 3. SEED TERMS ON INIT (after taxonomies are registered) ──────────
add_action('init', function () {
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
                error_log("State '{$name}' created.");
            }
        }
    }

    $asset_classes = [
        'house' => 'House', 'unit' => 'Unit', 'townhouse' => 'Townhouse',
        'commercial' => 'Commercial', 'land' => 'Land',
    ];

    foreach ($asset_classes as $slug => $name) {
        if (!term_exists($slug, 'asset_class')) {
            $result = wp_insert_term($name, 'asset_class', ['slug' => $slug]);
            if (is_wp_error($result)) {
                error_log("Asset class '{$slug}' failed: " . $result->get_error_message());
            } else {
                error_log("Asset class '{$name}' created.");
            }
        }
    }
}, 20); // Priority 20 so it runs after CPT/taxonomy registration

// ─── 4. ACF FIELD GROUPS ─────────────────────────────────────────────
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        error_log('ACF Pro not active — skipping field groups.');
        return;
    }

    // Article Settings
    acf_add_local_field_group([
        'key' => 'group_article_settings',
        'title' => 'Article Settings',
        'fields' => [
            ['key' => 'field_source_urls', 'label' => 'Source URLs', 'name' => 'source_urls', 'type' => 'url', 'multiple' => 1],
            ['key' => 'field_ai_pipeline_id', 'label' => 'AI Pipeline ID', 'name' => 'ai_pipeline_id', 'type' => 'text'],
            ['key' => 'field_risk_level', 'label' => 'Risk Level', 'name' => 'risk_level', 'type' => 'select', 'choices' => ['Low' => 'Low', 'Medium' => 'Medium', 'High' => 'High'], 'default_value' => 'Low'],
            ['key' => 'field_is_ai_generated', 'label' => 'Is AI Generated', 'name' => 'is_ai_generated', 'type' => 'true_false', 'default_value' => 0, 'ui' => 1],
        ],
        'location' => [
            [['param' => 'post_type', 'operator' => '==', 'value' => 'post']],
            [['param' => 'post_type', 'operator' => '==', 'value' => 'suburb_guide']],
            [['param' => 'post_type', 'operator' => '==', 'value' => 'policy_update']],
        ],
        'active' => true,
    ]);

    // Market Report Fields
    acf_add_local_field_group([
        'key' => 'group_market_report_fields',
        'title' => 'Market Report Fields',
        'fields' => [
            [
                'key' => 'field_key_metrics', 'label' => 'Key Metrics', 'name' => 'key_metrics', 'type' => 'group',
                'sub_fields' => [
                    ['key' => 'field_median_price', 'label' => 'Median Price', 'name' => 'median_price', 'type' => 'number', 'required' => 1, 'min' => 0, 'prepend' => '$'],
                    ['key' => 'field_yoy_change', 'label' => 'YoY Change (%)', 'name' => 'yoy_change', 'type' => 'number', 'min' => -100, 'max' => 100, 'append' => '%'],
                    ['key' => 'field_vacancy_rate', 'label' => 'Vacancy Rate (%)', 'name' => 'vacancy_rate', 'type' => 'number', 'min' => 0, 'max' => 100, 'append' => '%'],
                    ['key' => 'field_days_on_market', 'label' => 'Days on Market', 'name' => 'days_on_market', 'type' => 'number', 'min' => 0, 'append' => 'days'],
                ],
            ],
            ['key' => 'field_mr_source_urls', 'label' => 'Source URLs', 'name' => 'source_urls', 'type' => 'url', 'multiple' => 1],
            ['key' => 'field_mr_risk_level', 'label' => 'Risk Level', 'name' => 'risk_level', 'type' => 'select', 'choices' => ['Low' => 'Low', 'Medium' => 'Medium', 'High' => 'High'], 'default_value' => 'Low'],
            ['key' => 'field_mr_is_ai_generated', 'label' => 'Is AI Generated', 'name' => 'is_ai_generated', 'type' => 'true_false', 'default_value' => 0, 'ui' => 1],
        ],
        'location' => [['param' => 'post_type', 'operator' => '==', 'value' => 'market_report']],
        'active' => true,
    ]);

    // Agency Profile
    acf_add_local_field_group([
        'key' => 'group_agency_profile',
        'title' => 'Agency Profile',
        'fields' => [
            ['key' => 'field_agency_description', 'label' => 'Description', 'name' => 'description', 'type' => 'textarea'],
            ['key' => 'field_agency_website', 'label' => 'Website', 'name' => 'website', 'type' => 'url'],
            [
                'key' => 'field_agency_social_links', 'label' => 'Social Links', 'name' => 'social_links', 'type' => 'group',
                'sub_fields' => [
                    ['key' => 'field_facebook', 'label' => 'Facebook', 'name' => 'facebook', 'type' => 'url'],
                    ['key' => 'field_instagram', 'label' => 'Instagram', 'name' => 'instagram', 'type' => 'url'],
                    ['key' => 'field_linkedin', 'label' => 'LinkedIn', 'name' => 'linkedin', 'type' => 'url'],
                ],
            ],
        ],
        'location' => [['param' => 'post_type', 'operator' => '==', 'value' => 'agency']],
        'active' => true,
    ]);

    error_log('ACF field groups created.');
});

// ─── 5. NAVIGATION MENU ──────────────────────────────────────────────
add_action('init', function () {
    $menu_name = 'Primary Navigation';
    $menu_exists = wp_get_nav_menu_object($menu_name);

    if (!$menu_exists) {
        $menu_id = wp_create_nav_menu($menu_name);
        error_log("Menu created: {$menu_id}");
    } else {
        $menu_id = $menu_exists->term_id;
        error_log("Menu exists: {$menu_id}");
    }

    // Clear existing items
    $existing = wp_get_nav_menu_items($menu_name);
    if ($existing) {
        foreach ($existing as $item) {
            wp_delete_post($item->ID, true);
        }
    }

    $site_url = get_site_url();
    $order = 1;

    $items = [
        ['Market',      $site_url . '/category/market',      0],
        ['Policy',      $site_url . '/category/policy',      0],
        ['Development', $site_url . '/category/development', 0],
    ];

    // State parent
    $state_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title'  => 'State',
        'menu-item-url'    => $site_url . '/state',
        'menu-item-status' => 'publish',
        'menu-item-type'   => 'custom',
        'menu-item-order'  => $order++,
    ]);

    foreach (['NSW'=>'nsw','VIC'=>'vic','QLD'=>'qld','WA'=>'wa','SA'=>'sa','TAS'=>'tas','ACT'=>'act','NT'=>'nt'] as $label => $slug) {
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title'     => $label,
            'menu-item-url'       => $site_url . '/state/' . $slug,
            'menu-item-status'    => 'publish',
            'menu-item-type'      => 'custom',
            'menu-item-parent-id' => $state_id,
            'menu-item-order'     => $order++,
        ]);
    }

    $items[] = ['Technology', $site_url . '/category/technology', 0];
    $items[] = ['Finance',    $site_url . '/category/finance',    0];

    foreach ($items as $item) {
        wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title'  => $item[0],
            'menu-item-url'    => $item[1],
            'menu-item-status' => 'publish',
            'menu-item-type'   => 'custom',
            'menu-item-order'  => $order++,
        ]);
    }

    $locations = get_theme_mod('nav_menu_locations') ?: [];
    $locations['primary'] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);

    error_log("✅ Setup complete.");
}, 99); // Late priority to ensure CPTs/taxonomies exist

// ─── FIRE INIT FOR WP-CLI ─────────────────────────────────────────────
if (defined('WP_CLI') && WP_CLI) {
    // Force init to fire
    do_action('init');
    WP_CLI::success('Setup complete. CPTs, taxonomies, field groups, and menu created.');
}
