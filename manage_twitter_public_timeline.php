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
                <div id="aquarium" class="table-responsive"></div>
              </div>
            </div>
          </div>

      </article>
    </div>
  </section>
</div>
<?php
get_smartadmin_body_footer();
$matched_actions = [
    'get_' => 1,
];
?>
<style>
div.dt-toolbar {
  background: initial;
}
</style>
<script>
var entries_per_page = 50;
var base_path = 'admin';
var matched_actions = '<?php echo json_encode($matched_actions); ?>';
</script>
<?php
$files = [
    'jointjs/js/trans.js',
    'jointjs/js/AbstractBase.js',
    'jointjs/js/Form.js',
    'jointjs/js/OurTable.js',
    'index.js',
];
$jss = [
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react-with-addons.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/JSXTransformer.js"></script>',
];
foreach ($files as $file) {
    $tag = '<script src="'. $file. '?ver='. filemtime($file). '" type="text/jsx;harmony=true" charset="UTF-8"></script>';
    $jss[] = $tag;
}
get_smartadmin_footer($jss);
?>
