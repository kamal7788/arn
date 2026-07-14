<?php
/**
 * WPGraphQL schema extensions for AusRealNews.
 *
 * Exposes ACF fields and custom post types via GraphQL.
 * Requires WPGraphQL and WPGraphQL for ACF plugins.
 */
class AusRealNews_GraphQL_Schema {

    public static function register(): void {
        add_action('graphql_register_types', [self::class, 'register_types']);
    }

    public static function register_types(): void {
        // Extend Post type with ACF fields
        register_graphql_field('Post', 'sourceUrls', [
            'type'        => ['list_of' => 'String'],
            'description' => 'Research source URLs',
            'resolve'     => function ($post) {
                $value = get_field('source_urls', $post->ID);
                return is_array($value) ? $value : [];
            },
        ]);

        register_graphql_field('Post', 'aiPipelineId', [
            'type'        => 'String',
            'description' => 'n8n pipeline ID',
            'resolve'     => function ($post) {
                return get_field('ai_pipeline_id', $post->ID);
            },
        ]);

        register_graphql_field('Post', 'riskLevel', [
            'type'        => 'String',
            'description' => 'Content risk level',
            'resolve'     => function ($post) {
                return get_field('risk_level', $post->ID);
            },
        ]);

        register_graphql_field('Post', 'isAiGenerated', [
            'type'        => 'Boolean',
            'description' => 'Whether AI generated this content',
            'resolve'     => function ($post) {
                return (bool) get_field('is_ai_generated', $post->ID);
            },
        ]);

        // Market report key metrics
        register_graphql_field('MarketReport', 'keyMetrics', [
            'type'        => 'MarketReportMetrics',
            'description' => 'Key market metrics',
            'resolve'     => function ($post) {
                return get_field('key_metrics', $post->ID);
            },
        ]);

        // Register the metrics type
        register_graphql_object_type('MarketReportMetrics', [
            'description' => 'Market report key metrics',
            'fields'      => [
                'medianPrice'   => ['type' => 'Float'],
                'yoyChange'     => ['type' => 'Float'],
                'vacancyRate'   => ['type' => 'Float'],
                'daysOnMarket'  => ['type' => 'Int'],
            ],
        ]);

        // Extend AgentAuthor with profile fields
        register_graphql_field('AgentAuthor', 'headline', [
            'type'    => 'String',
            'resolve' => function ($user) {
                return get_user_meta($user->databaseId, 'headline', true);
            },
        ]);

        register_graphql_field('AgentAuthor', 'bio', [
            'type'    => 'String',
            'resolve' => function ($user) {
                return get_user_meta($user->databaseId, 'bio', true);
            },
        ]);

        register_graphql_field('AgentAuthor', 'serviceArea', [
            'type'    => 'String',
            'resolve' => function ($user) {
                return get_user_meta($user->databaseId, 'service_area', true);
            },
        ]);

        // Agency fields on posts
        register_graphql_field('Post', 'agency', [
            'type'        => 'Agency',
            'description' => 'Associated agency',
            'resolve'     => function ($post) {
                $agency_id = get_field('agency_id', $post->ID);
                if ($agency_id) {
                    return \WPGraphQL::get_registry()->get_type('Agency');
                }
                return null;
            },
        ]);
    }
}
