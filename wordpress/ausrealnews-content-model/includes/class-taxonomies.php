<?php
/**
 * Custom Taxonomies for Aus Real Estate News.
 */
class AusRealNews_Taxonomies {

    public static function register(): void {
        self::register_post_tag();
        self::register_state();
        self::register_city();
        self::register_suburb();
        self::register_asset_class();
    }

    /**
     * Register post_tag for all content types.
     */
    private static function register_post_tag(): void {
        // post_tag is native to WordPress, but we ensure it's attached to our CPTs
        register_taxonomy_for_object_type('post_tag', 'market_report');
        register_taxonomy_for_object_type('post_tag', 'suburb_guide');
        register_taxonomy_for_object_type('post_tag', 'policy_update');
    }

    private static function register_state(): void {
        register_taxonomy('state', ['post', 'market_report', 'suburb_guide', 'policy_update'], [
            'labels' => [
                'name'          => 'States',
                'singular_name' => 'State',
                'search_items'  => 'Search States',
                'all_items'     => 'All States',
                'edit_item'     => 'Edit State',
                'add_new_item'  => 'Add New State',
            ],
            'hierarchical'  => false,
            'public'        => true,
            'show_in_rest'  => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'state',
            'graphql_plural_name' => 'states',
            'rewrite'       => ['slug' => 'state'],
        ]);

        // Seed Australian states
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
                wp_insert_term($name, 'state', ['slug' => $slug]);
            }
        }
    }

    private static function register_city(): void {
        register_taxonomy('city', ['post', 'market_report', 'suburb_guide'], [
            'labels' => [
                'name'          => 'Cities',
                'singular_name' => 'City',
                'search_items'  => 'Search Cities',
                'all_items'     => 'All Cities',
                'edit_item'     => 'Edit City',
                'add_new_item'  => 'Add New City',
            ],
            'hierarchical'  => false,
            'public'        => true,
            'show_in_rest'  => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'city',
            'graphql_plural_name' => 'cities',
            'rewrite'       => ['slug' => 'city'],
        ]);
    }

    private static function register_suburb(): void {
        register_taxonomy('suburb', ['post', 'market_report', 'suburb_guide'], [
            'labels' => [
                'name'          => 'Suburbs',
                'singular_name' => 'Suburb',
                'search_items'  => 'Search Suburbs',
                'all_items'     => 'All Suburbs',
                'edit_item'     => 'Edit Suburb',
                'add_new_item'  => 'Add New Suburb',
            ],
            'hierarchical'  => false,
            'public'        => true,
            'show_in_rest'  => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'suburb',
            'graphql_plural_name' => 'suburbs',
            'rewrite'       => ['slug' => 'suburb'],
        ]);
    }

    private static function register_asset_class(): void {
        register_taxonomy('asset_class', ['post', 'market_report'], [
            'labels' => [
                'name'          => 'Asset Classes',
                'singular_name' => 'Asset Class',
                'search_items'  => 'Search Asset Classes',
                'all_items'     => 'All Asset Classes',
                'edit_item'     => 'Edit Asset Class',
                'add_new_item'  => 'Add New Asset Class',
            ],
            'hierarchical'  => true,
            'public'        => true,
            'show_in_rest'  => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'assetClass',
            'graphql_plural_name' => 'assetClasses',
            'rewrite'       => ['slug' => 'asset-class'],
        ]);

        // Seed asset classes
        $classes = [
            'house'      => 'House',
            'unit'       => 'Unit',
            'townhouse'  => 'Townhouse',
            'commercial' => 'Commercial',
            'land'       => 'Land',
        ];

        foreach ($classes as $slug => $name) {
            if (!term_exists($slug, 'asset_class')) {
                wp_insert_term($name, 'asset_class', ['slug' => $slug]);
            }
        }
    }
}
