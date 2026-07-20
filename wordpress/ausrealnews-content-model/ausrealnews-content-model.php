<?php
/**
 * Plugin Name: Aus Real Estate News — Content Model
 * Plugin URI: https://ausrealestatenews.com.au
 * Description: Registers custom post types, taxonomies, and ACF field groups for the Australian real estate news platform.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * Requires Plugins: acf-pro
 * Author: Aus Real Estate News
 * Author URI: https://ausrealestatenews.com.au
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ausrealnews
 */

defined('ABSPATH') || exit;

// ─── 1. REGISTER CPTs ────────────────────────────────────────────────
add_action('init', function () {
    $cpts = [
        'market_report' => [
            'label' => 'Market Reports',
            'singular' => 'Market Report',
            'graphql_single_name' => 'marketReport',
            'graphql_plural_name' => 'marketReports',
            'slug' => 'market-report',
        ],
        'suburb_guide' => [
            'label' => 'Suburb Guides',
            'singular' => 'Suburb Guide',
            'graphql_single_name' => 'suburbGuide',
            'graphql_plural_name' => 'suburbGuides',
            'slug' => 'suburb-guide',
        ],
        'policy_update' => [
            'label' => 'Policy Updates',
            'singular' => 'Policy Update',
            'graphql_single_name' => 'policyUpdate',
            'graphql_plural_name' => 'policyUpdates',
            'slug' => 'policy-update',
        ],
        'agency' => [
            'label' => 'Agencies',
            'singular' => 'Agency',
            'graphql_single_name' => 'agency',
            'graphql_plural_name' => 'agencies',
            'slug' => 'agencies',
        ],
    ];

    foreach ($cpts as $key => $args) {
        if (post_type_exists($key)) continue;

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
            'rewrite'            => ['slug' => $args['slug']],
        ]);
    }
});

// ─── 2. REGISTER TAXONOMIES ──────────────────────────────────────────
add_action('init', function () {
    $taxonomies = [
        'state' => [
            'label' => 'States', 'singular' => 'State',
            'graphql_single_name' => 'State', 'graphql_plural_name' => 'States',
            'hierarchical' => false,
            'post_types' => ['post', 'market_report', 'suburb_guide', 'policy_update'],
        ],
        'city' => [
            'label' => 'Cities', 'singular' => 'City',
            'graphql_single_name' => 'City', 'graphql_plural_name' => 'Cities',
            'hierarchical' => false,
            'post_types' => ['post', 'market_report', 'suburb_guide'],
        ],
        'suburb' => [
            'label' => 'Suburbs', 'singular' => 'Suburb',
            'graphql_single_name' => 'Suburb', 'graphql_plural_name' => 'Suburbs',
            'hierarchical' => false,
            'post_types' => ['post', 'market_report', 'suburb_guide'],
        ],
        'asset_class' => [
            'label' => 'Asset Classes', 'singular' => 'Asset Class',
            'graphql_single_name' => 'AssetClass', 'graphql_plural_name' => 'AssetClasses',
            'hierarchical' => true,
            'post_types' => ['post', 'market_report', 'suburb_guide'],
        ],
    ];

    foreach ($taxonomies as $key => $args) {
        if (taxonomy_exists($key)) continue;

        register_taxonomy($key, $args['post_types'], [
            'labels' => [
                'name'          => $args['label'],
                'singular_name' => $args['singular'],
                'add_new_item'  => 'Add New ' . $args['singular'],
                'edit_item'     => 'Edit ' . $args['singular'],
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
    }
});

// ─── 3. SEED TERMS ───────────────────────────────────────────────────
add_action('init', function () {
    $states = [
        'nsw' => 'New South Wales', 'vic' => 'Victoria', 'qld' => 'Queensland',
        'wa' => 'Western Australia', 'sa' => 'South Australia', 'tas' => 'Tasmania',
        'act' => 'Australian Capital Territory', 'nt' => 'Northern Territory',
    ];
    foreach ($states as $slug => $name) {
        if (!term_exists($slug, 'state')) {
            wp_insert_term($name, 'state', ['slug' => $slug]);
        }
    }

    $assets = ['house'=>'House','unit'=>'Unit','townhouse'=>'Townhouse','commercial'=>'Commercial','land'=>'Land'];
    foreach ($assets as $slug => $name) {
        if (!term_exists($slug, 'asset_class')) {
            wp_insert_term($name, 'asset_class', ['slug' => $slug]);
        }
    }
}, 20);

// ─── 4. ACF FIELD GROUPS ─────────────────────────────────────────────
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) return;

    // Article Settings
    acf_add_local_field_group([
        'key' => 'group_article_settings',
        'title' => 'Article Settings',
        'fields' => [
            ['key'=>'field_source_urls','label'=>'Source URLs','name'=>'source_urls','type'=>'url','multiple'=>1],
            ['key'=>'field_ai_pipeline_id','label'=>'AI Pipeline ID','name'=>'ai_pipeline_id','type'=>'text'],
            ['key'=>'field_risk_level','label'=>'Risk Level','name'=>'risk_level','type'=>'select','choices'=>['Low'=>'Low','Medium'=>'Medium','High'=>'High'],'default_value'=>'Low'],
            ['key'=>'field_is_ai_generated','label'=>'Is AI Generated','name'=>'is_ai_generated','type'=>'true_false','default_value'=>0,'ui'=>1],
        ],
        'location' => [
            [['param'=>'post_type','operator'=>'==','value'=>'post']],
            [['param'=>'post_type','operator'=>'==','value'=>'suburb_guide']],
            [['param'=>'post_type','operator'=>'==','value'=>'policy_update']],
        ],
        'active' => true,
    ]);

    // Market Report Fields
    acf_add_local_field_group([
        'key' => 'group_market_report_fields',
        'title' => 'Market Report Fields',
        'fields' => [
            ['key'=>'field_key_metrics','label'=>'Key Metrics','name'=>'key_metrics','type'=>'group','sub_fields'=>[
                ['key'=>'field_median_price','label'=>'Median Price','name'=>'median_price','type'=>'number','required'=>1,'min'=>0,'prepend'=>'$'],
                ['key'=>'field_yoy_change','label'=>'YoY Change (%)','name'=>'yoy_change','type'=>'number','min'=>-100,'max'=>100,'append'=>'%'],
                ['key'=>'field_vacancy_rate','label'=>'Vacancy Rate (%)','name'=>'vacancy_rate','type'=>'number','min'=>0,'max'=>100,'append'=>'%'],
                ['key'=>'field_days_on_market','label'=>'Days on Market','name'=>'days_on_market','type'=>'number','min'=>0,'append'=>'days'],
            ]],
            ['key'=>'field_mr_source_urls','label'=>'Source URLs','name'=>'source_urls','type'=>'url','multiple'=>1],
            ['key'=>'field_mr_risk_level','label'=>'Risk Level','name'=>'risk_level','type'=>'select','choices'=>['Low'=>'Low','Medium'=>'Medium','High'=>'High'],'default_value'=>'Low'],
            ['key'=>'field_mr_is_ai_generated','label'=>'Is AI Generated','name'=>'is_ai_generated','type'=>'true_false','default_value'=>0,'ui'=>1],
        ],
        'location' => [['param'=>'post_type','operator'=>'==','value'=>'market_report']],
        'active' => true,
    ]);

    // Agency Profile
    acf_add_local_field_group([
        'key' => 'group_agency_profile',
        'title' => 'Agency Profile',
        'fields' => [
            ['key'=>'field_agency_description','label'=>'Description','name'=>'description','type'=>'textarea'],
            ['key'=>'field_agency_website','label'=>'Website','name'=>'website','type'=>'url'],
            ['key'=>'field_agency_social_links','label'=>'Social Links','name'=>'social_links','type'=>'group','sub_fields'=>[
                ['key'=>'field_facebook','label'=>'Facebook','name'=>'facebook','type'=>'url'],
                ['key'=>'field_instagram','label'=>'Instagram','name'=>'instagram','type'=>'url'],
                ['key'=>'field_linkedin','label'=>'LinkedIn','name'=>'linkedin','type'=>'url'],
            ]],
        ],
        'location' => [['param'=>'post_type','operator'=>'==','value'=>'agency']],
        'active' => true,
    ]);
});
