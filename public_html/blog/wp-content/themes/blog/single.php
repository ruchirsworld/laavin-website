<?php 
/*Template Name: Single Blog*/
get_header(); 
?>
<?php if(have_posts()):while(have_posts()):the_post();  ?>

  <!-- start page-title -->
  
  <!-- BREADCRUMB
			============================================= -->
		


<style>
.width100 img{

	width: 100% !important;
}

.width10 img{
width: 100%;
    height: 65px;
}
.sticky.stick {
    position: sticky;
    
    z-index: 10;
    border-radius: 0 0 0.5em 0.5em;
}

.right-book {
    height: 420px;
}
.sticky {
    float: right;
}
</style>

 <section class="page-title-area text-white bg_cover" style="background-image: url(<?php echo get_template_directory_uri() ; ?>/action66/assets/images/bg/page-bg-1.jpg);">
            <div class="container">
                <!--======  Page-title-Inner ======-->
                <div class="page-title-inner text-center">
                    <h1 class="page-title">Blog </h1>
                    <div class="gd-breadcrumb">
                        <span class="breadcrumb-entry"><a href="#">Home</a></span>
                        <span class="separator"></span>
                        <span class="breadcrumb-entry active">Blog</span>
                    </div>
                </div>
            </div>
        </section><!--====== End Page-title-area section ======-->
        <!--====== Start Blog Details section ======-->
        <section class="blog-details-section pt-60 pb-60">
            <div class="container">
                <div class="row">
                    <div class="col-xl-8 col-lg-12">
                        <!--=== Blog Details Wrapper ===-->
                        <div class="blog-details-wrapper">
                            <!--=== Blog Post ===-->
                            <div class="blog-post wow fadeInUp">
                                <div class="post-meta">
                                    <span class="author"><img src="<?php echo get_template_directory_uri() ; ?>/action66/assets/images/blog/author-thumb-4.jpg" alt="author"><a href="#"><span>By</span> Admin</a></span>
                                    <span class="date"><a href="#"><time datetime="<?php echo get_the_date(); ?>"><?php echo get_the_date(); ?></time></a></span>
                                    
                                </div>
								<figure class="width100 mb-9"> <?php the_post_thumbnail('large'); ?></figure>
                                <div class="entry-content">
                                    <h3 class="title"><?php echo get_the_title(); ?></h3>
                                    
									<?php //echo get_the_content(); ?>
						
						
				<?php echo get_field('details'); ?> 
									
									
                                </div>
                               
                            </div>
                  
                            
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-12">
                        <!--=== Sidebar widget Area ===-->
                        <div class="sidebar-widget-area">
                            <!--=== Search Widget ===-->
                            
                            <!--=== Author Widget ===-->
                            
                            <!--=== Category Widget ===-->
                            <div class="sidebar-widget widget-category gray-bg mb-40 wow fadeInUp">
                                <h4 class="widget-title">Category</h4>
                                <ul>
<?php $categories = get_categories();
foreach($categories as $category) {
?>
    <li><a href="<?php  get_category_link($category->term_id) ?>"><?php echo  $category->name ; ?><i class="far fa-angle-double-right"></i></a></li>
    
    <?php
   
} ?>
                                   
                                </ul>
                            </div>
                            <!--=== Recent Post Widget ===-->
                            <div class="sidebar-widget widget-recent-post mb-40 wow fadeInUp">
                                <h4 class="widget-title">Recent News</h4>
                                <ul class="recent-post-list">
								
								
<?php
			$args = array(
			'posts_per_page'   => 3,
			'post_type'     => 'post',
			);
			// query
			$the_query = new WP_Query( $args );

			?>
			<?php if( $the_query->have_posts() ): ?>
			<?php
			while ( $the_query->have_posts() ) : $the_query->the_post(); ?> 								
                                    <li class="post-thumbnail-content">
                                        <figure class="width100"> <?php the_post_thumbnail('medium'); ?></figure>
                                        <div class="post-title-date">
                                            <span class="posted-on"><a href="#"><time datetime="<?php echo get_the_date(); ?>"><?php echo get_the_date(); ?></time></a></span>
                                            <h6><a href="<?php the_permalink(); ?>"><?php echo wp_trim_words( get_the_title(), 4 ); ?></a></h6>
                                        </div>
                                    </li>
  <?php  endwhile; ?>
	<?php endif;  wp_reset_query(); ?> 
                                </ul>
                            </div>
                           
                        </div>
                    </div>
                </div>
            </div>
        </section><!--====== End Blog Details section ======-->
        <!--====== Start Partners Section ======-->


<?php /*while(have_rows('mid_section')): the_row(); ?>

				<h5><?php the_sub_field('heading'); ?></h5>					
				<?php the_sub_field('detail'); ?>
				<?php endwhile; */?> 


  
 <?php endwhile; endif;  wp_reset_query(); ?>
 
<div id="footer" style="padding-top:40px">
<?php get_footer();  ?>
</div>
