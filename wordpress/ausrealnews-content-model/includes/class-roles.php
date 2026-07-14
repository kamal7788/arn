<?php
/**
 * Custom user roles for AusRealNews.
 */
class AusRealNews_Roles {

    public static function register(): void {
        add_role('agent_author', 'Agent Author', [
            'read'              => true,
            'edit_posts'        => true,
            'delete_posts'      => false,
            'publish_posts'     => false,
            'upload_files'      => true,
            'edit_published_posts' => false,
        ]);
    }

    /**
     * Remove the agent_author role on deactivation.
     */
    public static function remove(): void {
        remove_role('agent_author');
    }
}
