<?php
/**
 * Registers WordPress Abilities for the MCP server.
 *
 * Abilities expose WordPress content operations as MCP tools,
 * allowing AI agents to read, create, and update real estate content.
 */
class AusRealNews_RealEstateAbilities {

    public static function register_category(): void {
        wp_register_ability_category('ausrealnews', [
            'label'       => 'AusRealNews',
            'description' => 'Abilities for the Australian real estate news platform.',
        ]);
    }

    public static function register(): void {
        self::register_list_posts();
        self::register_get_post();
        self::register_create_post();
        self::register_update_post();
        self::register_list_taxonomies();
        self::register_list_agents();
        self::register_get_agency();
        self::register_list_market_reports();
    }

    /**
     * List posts by type with optional taxonomy filtering.
     */
    private static function register_list_posts(): void {
        wp_register_ability('ausrealnews/list-posts', [
            'label'       => 'List Posts',
            'description' => 'List published articles by post type with optional taxonomy filters.',
            'category'    => 'ausrealnews',
            'input_schema' => [
                'type'       => 'object',
                'properties' => [
                    'post_type'  => [
                        'type'        => 'string',
                        'description' => 'Post type to query',
                        'enum'        => ['post', 'market_report', 'suburb_guide', 'policy_update'],
                        'default'     => 'post',
                    ],
                    'state'      => [
                        'type'        => 'string',
                        'description' => 'Filter by state slug (e.g. nsw, vic, qld)',
                    ],
                    'city'       => [
                        'type'        => 'string',
                        'description' => 'Filter by city slug',
                    ],
                    'category'   => [
                        'type'        => 'string',
                        'description' => 'Filter by category slug',
                    ],
                    'per_page'   => [
                        'type'        => 'integer',
                        'description' => 'Number of results',
                        'default'     => 10,
                        'minimum'     => 1,
                        'maximum'     => 100,
                    ],
                    'page'       => [
                        'type'        => 'integer',
                        'description' => 'Page number',
                        'default'     => 1,
                    ],
                ],
            ],
            'execute_callback' => function ($input) {
                $post_type  = $input['post_type'] ?? 'post';
                $per_page   = $input['per_page'] ?? 10;
                $page       = $input['page'] ?? 1;

                $args = [
                    'post_type'      => $post_type,
                    'post_status'    => 'publish',
                    'posts_per_page' => $per_page,
                    'paged'          => $page,
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                ];

                // Tax query filters
                $tax_query = [];

                if (!empty($input['state'])) {
                    $tax_query[] = [
                        'taxonomy' => 'state',
                        'field'    => 'slug',
                        'terms'    => $input['state'],
                    ];
                }

                if (!empty($input['city'])) {
                    $tax_query[] = [
                        'taxonomy' => 'city',
                        'field'    => 'slug',
                        'terms'    => $input['city'],
                    ];
                }

                if (!empty($input['category'])) {
                    $tax_query[] = [
                        'taxonomy' => 'category',
                        'field'    => 'slug',
                        'terms'    => $input['category'],
                    ];
                }

                if (!empty($tax_query)) {
                    $tax_query['relation'] = 'AND';
                    $args['tax_query'] = $tax_query;
                }

                $query = new WP_Query($args);
                $posts = [];

                foreach ($query->posts as $post) {
                    $posts[] = [
                        'id'           => $post->ID,
                        'title'        => $post->post_title,
                        'slug'         => $post->post_name,
                        'excerpt'      => wp_trim_words($post->post_excerpt ?: wp_trim_words($post->post_content, 30), 30),
                        'date'         => $post->post_date,
                        'modified'     => $post->post_modified,
                        'author_id'    => $post->post_author,
                        'author_name'  => get_the_author_meta('display_name', $post->post_author),
                        'permalink'    => get_permalink($post),
                        'featured_image' => get_the_post_thumbnail_url($post, 'medium'),
                        'acf'          => [
                            'source_urls'    => get_field('source_urls', $post->ID) ?: [],
                            'ai_pipeline_id' => get_field('ai_pipeline_id', $post->ID),
                            'risk_level'     => get_field('risk_level', $post->ID),
                            'is_ai_generated'=> (bool) get_field('is_ai_generated', $post->ID),
                        ],
                    ];
                }

                return [
                    'posts'     => $posts,
                    'total'     => $query->found_posts,
                    'pages'     => $query->max_num_pages,
                    'page'      => $page,
                ];
            },
            'permission_callback' => function () {
                return current_user_can('read');
            },
            'meta' => [
                'annotations' => [
                    'readonly'     => true,
                    'idempotent'   => true,
                    'openWorldHint'=> false,
                ],
                'mcp' => [
                    'public' => true,
                    'type'   => 'tool',
                ],
            ],
        ]);
    }

    /**
     * Get a single post by ID or slug.
     */
    private static function register_get_post(): void {
        wp_register_ability('ausrealnews/get-post', [
            'label'       => 'Get Post',
            'description' => 'Retrieve a single article by ID or slug with full content and metadata.',
            'category'    => 'ausrealnews',
            'input_schema' => [
                'type'       => 'object',
                'properties' => [
                    'post_id' => ['type' => 'integer', 'description' => 'WordPress post ID'],
                    'slug'    => ['type' => 'string',  'description' => 'Post slug'],
                ],
            ],
            'execute_callback' => function ($input) {
                $post = null;

                if (!empty($input['post_id'])) {
                    $post = get_post($input['post_id']);
                } elseif (!empty($input['slug'])) {
                    $post = get_page_by_path($input['slug'], OBJECT, ['post', 'market_report', 'suburb_guide', 'policy_update']);
                }

                if (!$post || $post->post_status !== 'publish') {
                    return ['error' => 'Post not found'];
                }

                return [
                    'id'          => $post->ID,
                    'title'       => $post->post_title,
                    'content'     => $post->post_content,
                    'excerpt'     => $post->post_excerpt,
                    'slug'        => $post->post_name,
                    'type'        => $post->post_type,
                    'date'        => $post->post_date,
                    'modified'    => $post->post_modified,
                    'author_id'   => $post->post_author,
                    'author_name' => get_the_author_meta('display_name', $post->post_author),
                    'permalink'   => get_permalink($post),
                    'acf'         => [
                        'source_urls'     => get_field('source_urls', $post->ID) ?: [],
                        'ai_pipeline_id'  => get_field('ai_pipeline_id', $post->ID),
                        'risk_level'      => get_field('risk_level', $post->ID),
                        'is_ai_generated' => (bool) get_field('is_ai_generated', $post->ID),
                    ],
                    'taxonomies' => [
                        'categories'   => wp_get_post_terms($post->ID, 'category', ['fields' => 'names']),
                        'states'       => wp_get_post_terms($post->ID, 'state', ['fields' => 'names']),
                        'cities'       => wp_get_post_terms($post->ID, 'city', ['fields' => 'names']),
                        'suburbs'      => wp_get_post_terms($post->ID, 'suburb', ['fields' => 'names']),
                        'asset_classes'=> wp_get_post_terms($post->ID, 'asset_class', ['fields' => 'names']),
                    ],
                ];
            },
            'permission_callback' => function () {
                return current_user_can('read');
            },
            'meta' => [
                'annotations' => ['readonly' => true, 'idempotent' => true],
                'mcp'         => ['public' => true, 'type' => 'tool'],
            ],
        ]);
    }

    /**
     * Create a new post with taxonomies and ACF fields.
     */
    private static function register_create_post(): void {
        wp_register_ability('ausrealnews/create-post', [
            'label'       => 'Create Post',
            'description' => 'Create a new article with title, content, categories, and metadata.',
            'category'    => 'ausrealnews',
            'input_schema' => [
                'type'       => 'object',
                'properties' => [
                    'title'          => ['type' => 'string',  'description' => 'Post title'],
                    'content'        => ['type' => 'string',  'description' => 'Post content (HTML)'],
                    'post_type'      => [
                        'type' => 'string',
                        'enum' => ['post', 'market_report', 'suburb_guide', 'policy_update'],
                        'default' => 'post',
                    ],
                    'status'         => [
                        'type' => 'string',
                        'enum' => ['draft', 'publish'],
                        'default' => 'draft',
                    ],
                    'categories'     => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Category slugs'],
                    'states'         => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'State slugs'],
                    'cities'         => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'City slugs'],
                    'suburbs'        => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Suburb slugs'],
                    'asset_classes'  => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Asset class slugs'],
                    'source_urls'    => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'Research source URLs'],
                    'ai_pipeline_id' => ['type' => 'string',  'description' => 'n8n pipeline ID'],
                    'risk_level'     => ['type' => 'string',  'enum' => ['Low', 'Medium', 'High'], 'default' => 'Low'],
                    'is_ai_generated'=> ['type' => 'boolean', 'default' => false],
                ],
                'required' => ['title', 'content'],
            ],
            'execute_callback' => function ($input) {
                $post_id = wp_insert_post([
                    'post_title'   => sanitize_text_field($input['title']),
                    'post_content' => wp_kses_post($input['content']),
                    'post_type'    => $input['post_type'] ?? 'post',
                    'post_status'  => $input['status'] ?? 'draft',
                    'post_author'  => get_current_user_id(),
                ]);

                if (is_wp_error($post_id)) {
                    return ['error' => $post_id->get_error_message()];
                }

                // Set taxonomy terms
                $tax_map = [
                    'categories'   => 'category',
                    'states'       => 'state',
                    'cities'       => 'city',
                    'suburbs'      => 'suburb',
                    'asset_classes'=> 'asset_class',
                ];

                foreach ($tax_map as $input_key => $taxonomy) {
                    if (!empty($input[$input_key]) && is_array($input[$input_key])) {
                        wp_set_object_terms($post_id, $input[$input_key], $taxonomy);
                    }
                }

                // Set ACF fields
                if (!empty($input['source_urls'])) {
                    update_field('source_urls', $input['source_urls'], $post_id);
                }
                if (isset($input['ai_pipeline_id'])) {
                    update_field('ai_pipeline_id', $input['ai_pipeline_id'], $post_id);
                }
                if (isset($input['risk_level'])) {
                    update_field('risk_level', $input['risk_level'], $post_id);
                }
                if (isset($input['is_ai_generated'])) {
                    update_field('is_ai_generated', $input['is_ai_generated'], $post_id);
                }

                return [
                    'post_id'   => $post_id,
                    'title'     => get_the_title($post_id),
                    'slug'      => get_post_field('post_name', $post_id),
                    'status'    => get_post_status($post_id),
                    'permalink' => get_permalink($post_id),
                ];
            },
            'permission_callback' => function () {
                return current_user_can('publish_posts');
            },
            'meta' => [
                'annotations' => ['readonly' => false, 'destructive' => false, 'idempotent' => false],
                'mcp'         => ['public' => true, 'type' => 'tool'],
            ],
        ]);
    }

    /**
     * Update an existing post.
     */
    private static function register_update_post(): void {
        wp_register_ability('ausrealnews/update-post', [
            'label'       => 'Update Post',
            'description' => 'Update an existing article by ID.',
            'category'    => 'ausrealnews',
            'input_schema' => [
                'type'       => 'object',
                'properties' => [
                    'post_id'        => ['type' => 'integer', 'description' => 'WordPress post ID to update'],
                    'title'          => ['type' => 'string'],
                    'content'        => ['type' => 'string'],
                    'status'         => ['type' => 'string', 'enum' => ['draft', 'publish']],
                    'categories'     => ['type' => 'array', 'items' => ['type' => 'string']],
                    'states'         => ['type' => 'array', 'items' => ['type' => 'string']],
                    'risk_level'     => ['type' => 'string', 'enum' => ['Low', 'Medium', 'High']],
                    'is_ai_generated'=> ['type' => 'boolean'],
                ],
                'required' => ['post_id'],
            ],
            'execute_callback' => function ($input) {
                $post_id = $input['post_id'];
                $post = get_post($post_id);

                if (!$post) {
                    return ['error' => 'Post not found'];
                }

                $update = ['ID' => $post_id];

                if (isset($input['title'])) {
                    $update['post_title'] = sanitize_text_field($input['title']);
                }
                if (isset($input['content'])) {
                    $update['post_content'] = wp_kses_post($input['content']);
                }
                if (isset($input['status'])) {
                    $update['post_status'] = $input['status'];
                }

                $result = wp_update_post($update, true);
                if (is_wp_error($result)) {
                    return ['error' => $result->get_error_message()];
                }

                // Update taxonomies if provided
                if (!empty($input['categories'])) {
                    wp_set_object_terms($post_id, $input['categories'], 'category');
                }
                if (!empty($input['states'])) {
                    wp_set_object_terms($post_id, $input['states'], 'state');
                }

                // Update ACF fields
                if (isset($input['risk_level'])) {
                    update_field('risk_level', $input['risk_level'], $post_id);
                }
                if (isset($input['is_ai_generated'])) {
                    update_field('is_ai_generated', $input['is_ai_generated'], $post_id);
                }

                return [
                    'post_id'   => $post_id,
                    'title'     => get_the_title($post_id),
                    'status'    => get_post_status($post_id),
                    'permalink' => get_permalink($post_id),
                ];
            },
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
            'meta' => [
                'annotations' => ['readonly' => false, 'destructive' => false, 'idempotent' => true],
                'mcp'         => ['public' => true, 'type' => 'tool'],
            ],
        ]);
    }

    /**
     * List taxonomy terms.
     */
    private static function register_list_taxonomies(): void {
        wp_register_ability('ausrealnews/list-taxonomies', [
            'label'       => 'List Taxonomies',
            'description' => 'List available taxonomy terms (states, cities, suburbs, asset classes, categories).',
            'category'    => 'ausrealnews',
            'input_schema' => [
                'type'       => 'object',
                'properties' => [
                    'taxonomy' => [
                        'type'        => 'string',
                        'description' => 'Taxonomy to query',
                        'enum'        => ['state', 'city', 'suburb', 'asset_class', 'category'],
                    ],
                    'parent'   => [
                        'type'        => 'integer',
                        'description' => 'Parent term ID (for hierarchical taxonomies)',
                    ],
                ],
                'required' => ['taxonomy'],
            ],
            'execute_callback' => function ($input) {
                $taxonomy = $input['taxonomy'];
                $args = ['hide_empty' => true];

                if (isset($input['parent'])) {
                    $args['parent'] = $input['parent'];
                }

                $terms = get_terms($taxonomy, $args);

                if (is_wp_error($terms)) {
                    return ['error' => $terms->get_error_message()];
                }

                return array_map(fn($t) => [
                    'id'    => $t->term_id,
                    'name'  => $t->name,
                    'slug'  => $t->slug,
                    'count' => $t->count,
                ], $terms);
            },
            'permission_callback' => function () {
                return current_user_can('read');
            },
            'meta' => [
                'annotations' => ['readonly' => true, 'idempotent' => true],
                'mcp'         => ['public' => true, 'type' => 'tool'],
            ],
        ]);
    }

    /**
     * List agent profiles (users with agent_author role).
     */
    private static function register_list_agents(): void {
        wp_register_ability('ausrealnews/list-agents', [
            'label'       => 'List Agents',
            'description' => 'List real estate agent profiles with their metadata.',
            'category'    => 'ausrealnews',
            'input_schema' => [
                'type'       => 'object',
                'properties' => [
                    'per_page' => ['type' => 'integer', 'default' => 20],
                    'page'     => ['type' => 'integer', 'default' => 1],
                ],
            ],
            'execute_callback' => function ($input) {
                $args = [
                    'role'    => 'agent_author',
                    'number'  => $input['per_page'] ?? 20,
                    'offset'  => (($input['page'] ?? 1) - 1) * ($input['per_page'] ?? 20),
                ];

                $users = get_users($args);
                $agents = [];

                foreach ($users as $user) {
                    $agents[] = [
                        'id'           => $user->ID,
                        'name'         => $user->display_name,
                        'email'        => $user->user_email,
                        'headline'     => get_user_meta($user->ID, 'headline', true),
                        'bio'          => get_user_meta($user->ID, 'bio', true),
                        'service_area' => get_user_meta($user->ID, 'service_area', true),
                        'agency_id'    => get_user_meta($user->ID, 'agency_id', true),
                    ];
                }

                return ['agents' => $agents];
            },
            'permission_callback' => function () {
                return current_user_can('read');
            },
            'meta' => [
                'annotations' => ['readonly' => true, 'idempotent' => true],
                'mcp'         => ['public' => true, 'type' => 'tool'],
            ],
        ]);
    }

    /**
     * Get agency profile by ID.
     */
    private static function register_get_agency(): void {
        wp_register_ability('ausrealnews/get-agency', [
            'label'       => 'Get Agency',
            'description' => 'Retrieve an agency profile by ID or slug.',
            'category'    => 'ausrealnews',
            'input_schema' => [
                'type'       => 'object',
                'properties' => [
                    'agency_id' => ['type' => 'integer', 'description' => 'Agency post ID'],
                    'slug'      => ['type' => 'string',  'description' => 'Agency slug'],
                ],
            ],
            'execute_callback' => function ($input) {
                $post = null;

                if (!empty($input['agency_id'])) {
                    $post = get_post($input['agency_id']);
                } elseif (!empty($input['slug'])) {
                    $post = get_page_by_path($input['slug'], OBJECT, 'agency');
                }

                if (!$post) {
                    return ['error' => 'Agency not found'];
                }

                return [
                    'id'          => $post->ID,
                    'name'        => $post->post_title,
                    'slug'        => $post->post_name,
                    'description' => get_field('description', $post->ID),
                    'website'     => get_field('website', $post->ID),
                    'social_links'=> get_field('social_links', $post->ID) ?: [],
                ];
            },
            'permission_callback' => function () {
                return current_user_can('read');
            },
            'meta' => [
                'annotations' => ['readonly' => true, 'idempotent' => true],
                'mcp'         => ['public' => true, 'type' => 'tool'],
            ],
        ]);
    }

    /**
     * List market reports with key metrics.
     */
    private static function register_list_market_reports(): void {
        wp_register_ability('ausrealnews/list-market-reports', [
            'label'       => 'List Market Reports',
            'description' => 'List market reports with key metrics (median price, YoY change, vacancy, DOM).',
            'category'    => 'ausrealnews',
            'input_schema' => [
                'type'       => 'object',
                'properties' => [
                    'state'    => ['type' => 'string', 'description' => 'State slug filter'],
                    'per_page' => ['type' => 'integer', 'default' => 10],
                    'page'     => ['type' => 'integer', 'default' => 1],
                ],
            ],
            'execute_callback' => function ($input) {
                $args = [
                    'post_type'      => 'market_report',
                    'post_status'    => 'publish',
                    'posts_per_page' => $input['per_page'] ?? 10,
                    'paged'          => $input['page'] ?? 1,
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                ];

                if (!empty($input['state'])) {
                    $args['tax_query'] = [[
                        'taxonomy' => 'state',
                        'field'    => 'slug',
                        'terms'    => $input['state'],
                    ]];
                }

                $query = new WP_Query($args);
                $reports = [];

                foreach ($query->posts as $post) {
                    $metrics = get_field('key_metrics', $post->ID) ?: [];
                    $reports[] = [
                        'id'           => $post->ID,
                        'title'        => $post->post_title,
                        'slug'         => $post->post_name,
                        'date'         => $post->post_date,
                        'permalink'    => get_permalink($post),
                        'key_metrics'  => [
                            'median_price'   => $metrics['median_price'] ?? 0,
                            'yoy_change'     => $metrics['yoy_change'] ?? 0,
                            'vacancy_rate'   => $metrics['vacancy_rate'] ?? 0,
                            'days_on_market' => $metrics['days_on_market'] ?? 0,
                        ],
                        'states'       => wp_get_post_terms($post->ID, 'state', ['fields' => 'slugs']),
                        'cities'       => wp_get_post_terms($post->ID, 'city', ['fields' => 'slugs']),
                        'asset_classes'=> wp_get_post_terms($post->ID, 'asset_class', ['fields' => 'slugs']),
                    ];
                }

                return [
                    'reports' => $reports,
                    'total'   => $query->found_posts,
                    'pages'   => $query->max_num_pages,
                ];
            },
            'permission_callback' => function () {
                return current_user_can('read');
            },
            'meta' => [
                'annotations' => ['readonly' => true, 'idempotent' => true],
                'mcp'         => ['public' => true, 'type' => 'tool'],
            ],
        ]);
    }
}
