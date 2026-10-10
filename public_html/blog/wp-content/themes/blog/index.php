<?php 
/*Template Name:Home*/
get_header(); 
?>


<style>
.width100{
    max-width: 100%;
        height: 250px;
    
}

.width100 img {
    max-width: 100%;
    height: 260px;
}
</style>

<section class="page-title-area text-white bg_cover" style="background-image: url(<?php echo get_template_directory_uri() ; ?>/action66/assets/images/bg/page-bg-1.jpg);">
            <div class="container">
                <!--======  Page-title-Inner ======-->
                <div class="page-title-inner text-center">
                    <h1 class="page-title">Blog</h1>
                    <div class="gd-breadcrumb">
                        <span class="breadcrumb-entry"><a href="#">Home</a></span>
                        <span class="separator"></span>
                        <span class="breadcrumb-entry active">Blog</span>
                    </div>
                </div>
            </div>
        </section><!--====== End Page-title-area section ======-->
        <section class="blog-section pt-60 pb-30">
  <div class="container">
    
    <div class="row justify-content-center">
      
	  
<?php
/*$categories = get_categories();

foreach($categories as $category) {
   echo  $category->name ;
}*/




			$args = array(
			'posts_per_page'   => 100,
			'post_type'     => 'post',
			);
			// query
			$the_query = new WP_Query( $args );

			?>
			<?php if( $the_query->have_posts() ): ?>
			<?php
			while ( $the_query->have_posts() ) : $the_query->the_post(); ?> 
			
<div class="col-xl-4 col-md-6 col-sm-12"> 
        <!--====== Single Blog Post  ======-->
        <div class="single-blog-post mb-40 wow fadeInUp" data-wow-delay=".2s">
          <div class="post-thumbnail"> 
		  
		  <figure class="width100"> <?php the_post_thumbnail('medium'); ?></figure>
		   </div>
          <div class="entry-content">
              
              <?php $categories = get_the_category();

if ( ! empty( $categories ) ) {
    ?>
     <a href="<?php the_permalink(); ?>" class="cat-link"><?php echo esc_html( $categories[0]->name );	?></a>
    <?php
	
}?>


              
 <h4 class="entry-title"><a href="<?php the_permalink(); ?>"><?php echo wp_trim_words( get_the_title(), 4 ); ?></a></h4>
            <?php echo wp_trim_words( get_the_content(), 20 ); ?>
          </div>
        </div>
      </div>



<?php echo wp_trim_words( get_the_category(), 4 ); ?>

	<?php  endwhile; ?>
	<?php endif;  wp_reset_query(); ?> 

	 
    </div>
  </div>
</section>




	
	
	
<?php get_footer();  ?>

