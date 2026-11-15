<?php
/**
 * Plugin Name: {{TITLE}}
 * Description: A SocialJet add-on.
 * Version:     0.1.0
 * Requires at least: 5.0
 * Requires PHP: 7.4
 * Requires Plugins: socialjet
 * License:     GPL-3.0-or-later
 * Text Domain: {{SLUG}}
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( '{{PHP_CONST}}_VERSION', '0.1.0' );

/**
 * Load the add-on's UI module on the SocialJet admin page. SocialJet loads it after
 * its own registry and before rendering, and provides React/antd/dayjs to it.
 */
add_filter( 'socialjet_views', function ( $views ) {
    $views[] = [
        'handle' => '{{SLUG}}',
        'src'    => plugins_url( 'build/index.js', __FILE__ ),
        'ver'    => {{PHP_CONST}}_VERSION,
    ];

    return $views;
} );

add_action( 'admin_notices', function () {
    if ( ! defined( 'SOCIALJET_VERSION' ) ) {
        echo '<div class="notice notice-error"><p>' . esc_html__( '{{TITLE}} needs the SocialJet plugin to be active.', '{{SLUG}}' ) . '</p></div>';
    }
} );
