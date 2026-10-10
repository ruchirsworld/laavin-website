<?php	
register_nav_menu( 'Sucraftstutorial Main', 'Sucraftstutorial Main' );
register_nav_menu( 'Sucraftstutorial Footer', 'Sucraftstutorial Footer' );


require_once('wp-bootstrap-navwalker.php');
add_theme_support( 'post-thumbnails' );
add_theme_support( 'custom-background' );
show_admin_bar(false);


if( function_exists('acf_add_options_page') ) {
 
	$option_page = acf_add_options_page(array(
		'page_title' 	=> 'Theme General Settings',
		'menu_title' 	=> 'Theme Settings',
		'menu_slug' 	=> 'theme-general-settings',
		'capability' 	=> 'edit_posts',
		'redirect' 	=> false
	));


acf_add_options_sub_page(array(
'page_title' => 'Theme Header Settings',
'menu_title'	=> 'Header',
'parent_slug'	=> 'theme-general-settings',
));

acf_add_options_sub_page(array(
'page_title' => 'Theme Footer Settings',
'menu_title'	=> 'Footer',
'parent_slug'	=> 'theme-general-settings',
));

acf_add_options_sub_page(array(
'page_title' => 'Copyright Text',
'menu_title'	=> 'Copyright Text',
'parent_slug'	=> 'theme-general-settings',
));

}



add_filter('wpdiscuz_profile_url', 'wpdiscuz_bp_profile_url', 10, 2);
function wpdiscuz_bp_profile_url($profile_url, $user) {
    if ($user && class_exists('BuddyPress')) {
        $profile_url = bp_core_get_user_domain($user->ID);
    }
    return $profile_url;
}


if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}


add_action( 'widgets_init', 'my_register_sidebars' );

function my_register_sidebars() { /* Register dynamic sidebar 'new_sidebar' */
register_sidebar( array(
'id' => 'new_sidebar',
'name' => __( 'New Sidebar' ),
'description' => __( 'A short description of the sidebar.' ),
'before_widget' => '<div id="%1$s" class="widget %2$s">',
'after_widget' => '</div>',
'before_title' => '<h3 class="widget-title">',
'after_title' => '</h3>' ) ); /* Repeat the code pattern above for additional sidebars. */
}


add_action( 'widgets_init', 'my_register_sidebars1' );

function my_register_sidebars1() { /* Register dynamic sidebar 'left_sidebar' */
register_sidebar( array(
'id' => 'left_sidebar',
'name' => __( 'Left Sidebar' ),
'description' => __( 'A short description of the sidebar.' ),
'before_widget' => '<div id="%1$s" class="widget %2$s">',
'after_widget' => '</div>',
'before_title' => '<h3 class="widget-title">',
'after_title' => '</h3>' ) ); /* Repeat the code pattern above for additional sidebars. */
}



add_action( 'widgets_init', 'my_register_sidebars2' );

function my_register_sidebars2() { /* Register dynamic sidebar 'left_search' */
register_sidebar( array(
'id' => 'left_search',
'name' => __( 'Left Search' ),
'description' => __( 'A short description of the sidebar.' ),
'before_widget' => '<div id="%1$s" class="widget %2$s">',
'after_widget' => '</div>',
'before_title' => '<h3 class="widget-title">',
'after_title' => '</h3>' ) ); /* Repeat the code pattern above for additional sidebars. */
}
