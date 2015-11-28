<?php

require_once "/var/www/html/libs/common.php";
require_once( "../wp-blog-header.php" );

session_start();
preload_libraries();
$css = [
    '<link href="mermaid.css" media="screen" type="text/css" rel="stylesheet" />',
];
get_smartadmin_header($css);
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
<script>
function test1() {
  console.log("test1");
}
var test2 = function() {
  console.log("test2");
}
var test3 = function() {
  console.log(mermaidInstance);
}
</script>
<?php
get_smartadmin_body_footer();
$js = [
    '<script src="https://fb.me/react-0.14.3.js"></script>',
    '<script src="https://fb.me/react-dom-0.14.3.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"></script>',
    '<script src="https://cdn.rawgit.com/knsv/mermaid/0.5.6/dist/mermaid.js"></script>',
    '<script src="mermaid.js" type="text/babel"></script>',
];
get_smartadmin_footer($js);
