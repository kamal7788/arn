<?php
/**
 * Custom Post Types for AusRealNews.
 */
class AusRealNews_PostTypes {

    public static function register(): void {
        self::register_market_report();
        self::register_suburb_guide();
        self::register_policy_update();
        self::register_agency();
    }

    private static function register_market_report(): void {
        register_post_type('market_report', [
            'labels' => [
                'name'          => 'Market Reports',
                'singular_name' => 'Market Report',
                'add_new_item'  => 'Add New Market Report',
                'edit_item'     => 'Edit Market Report',
                'view_item'     => 'View Market Report',
                'search_items'  => 'Search Market Reports',
            ],
            'public'       => true,
            'has_archive'  => true,
            'rewrite'      => ['slug' => 'market-report'],
            'menu_icon'    => 'dashicons-chart-area',
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'marketReport',
            'graphql_plural_name' => 'marketReports',
            'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'taxonomies'   => ['category', 'state', 'city', 'suburb', 'asset_class'],
        ]);
    }

    private static function register_suburb_guide(): void {
        register_post_type('suburb_guide', [
            'labels' => [
                'name'          => 'Suburb Guides',
                'singular_name' => 'Suburb Guide',
                'add_new_item'  => 'Add New Suburb Guide',
                'edit_item'     => 'Edit Suburb Guide',
                'view_item'     => 'View Suburb Guide',
                'search_items'  => 'Search Suburb Guides',
            ],
            'public'       => true,
            'has_archive'  => true,
            'rewrite'      => ['slug' => 'suburb-guide'],
            'menu_icon'    => 'dashicons-location-alt',
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'suburbGuide',
            'graphql_plural_name' => 'suburbGuides',
            'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'taxonomies'   => ['category', 'state', 'city', 'suburb', 'asset_class'],
        ]);
    }

    private static function register_policy_update(): void {
        register_post_type('policy_update', [
            'labels' => [
                'name'          => 'Policy Updates',
                'singular_name' => 'Policy Update',
                'add_new_item'  => 'Add New Policy Update',
                'edit_item'     => 'Edit Policy Update',
                'view_item'     => 'View Policy Update',
                'search_items'  => 'Search Policy Updates',
            ],
            'public'       => true,
            'has_archive'  => true,
            'rewrite'      => ['slug' => 'policy-update'],
            'menu_icon'    => 'dashicons-clipboard',
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'policyUpdate',
            'graphql_plural_name' => 'policyUpdates',
            'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'taxonomies'   => ['category', 'state'],
        ]);
    }

    private static function register_agency(): void {
        register_post_type('agency', [
            'labels' => [
                'name'          => 'Agencies',
                'singular_name' => 'Agency',
                'add_new_item'  => 'Add New Agency',
                'edit_item'     => 'Edit Agency',
                'view_item'     => 'View Agency',
            ],
            'public'       => true,
            'has_archive'  => true,
            'rewrite'      => ['slug' => 'agency'],
            'menu_icon'    => 'dashicons-building',
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'agency',
            'graphql_plural_name' => 'agencies',
            'supports'     => ['title', 'editor', 'thumbnail', 'custom-fields'],
        ]);
    }
}
