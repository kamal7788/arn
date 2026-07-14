<?php
/**
 * Custom user roles for Aus Real Estate News.
 */
class AusRealNews_Roles {

    public static function register(): void {
        // Editor-in-Chief: full editorial control, no plugin/theme/user management
        add_role('editor_in_chief', 'Editor in Chief', [
            'read'                   => true,
            'edit_posts'             => true,
            'edit_others_posts'      => true,
            'publish_posts'          => true,
            'delete_posts'           => true,
            'delete_others_posts'    => true,
            'manage_categories'      => true,
            'upload_files'           => true,
            'edit_published_posts'   => true,
            'delete_published_posts' => true,
        ]);

        // Agent Contributor: paying agent, limited backend access
        add_role('agent_contributor', 'Agent Contributor', [
            'read'              => true,
            'edit_posts'        => true,
            'delete_posts'      => true,
            'upload_files'      => true,
            // Explicitly denied:
            'publish_posts'     => false,
            'edit_others_posts' => false,
            'delete_others_posts' => false,
            'manage_categories' => false,
            'manage_options'    => false,
        ]);
    }

    /**
     * Remove custom roles on deactivation.
     */
    public static function remove(): void {
        remove_role('editor_in_chief');
        remove_role('agent_contributor');
        // Legacy cleanup
        remove_role('agent_author');
    }
}
