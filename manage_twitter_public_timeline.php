<?php

require_once "/var/www/html/libs/common.php";
require_once( "../wp-blog-header.php" );

session_start();
preload_libraries();
get_smartadmin_header();
get_smartadmin_body_header();
?>

<div id="content">
  <div class="row">
  </div>
  <section id="widget-grid" class="">
    <div class="row">
      <article class="col-xs-12 col-sm-12 col-md-12 col-lg-12">

          <div class="jarviswidget" id="wid-id-0">
            <header>
              <span class="widget-icon"> <i class="fa fa-table"></i> </span>
              <h2><strong>Title</strong> <i>Change</i></h2>
            </header>
            <div>
              <div class="jarviswidget-editbox"></div>
              <div class="widget-body">

                <form action="" method="post" class="smart-form">
                  <div id="aquarium" class="table-responsive"></div>
                </form>

              </div>
            </div>
          </div>

      </article>
    </div>
  </section>
</div>
<?php
get_smartadmin_body_footer();
$jss = [
  '<script src="bundle.js"></script>',
];
get_smartadmin_footer($jss);
?>
