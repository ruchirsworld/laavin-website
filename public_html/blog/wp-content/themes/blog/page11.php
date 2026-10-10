<?php
get_header(); ?>
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>				
<div class="rs-breadcrumbs">
  <div class="breadcrumbs-image"> <img src="<?php echo get_template_directory_uri() ; ?>/images/breadcrumbs/about.jpg" alt="Breadcrumbs Image">
    <div class="breadcrumbs-inner">
      <div class="container">
        <div class="breadcrumbs-text">
          <h1 class="breadcrumbs-title"><?php the_title(); ?></h1>
          <ul class="breadcrumbs-subtitle">
            <li><a href="<?php site_url(); ?>">Home >></a></li>
            <li><?php the_title(); ?></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
<?php the_content(); ?>
<?php endwhile; endif; ?>
<?php get_footer(); ?>
