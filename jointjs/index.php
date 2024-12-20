<?php

require_once "/var/www/html/libs/common.php";
require_once( "../../wp-blog-header.php" );

session_start();
preload_libraries();
$css = [
    '<link href="http://www.jointjs.com/downloads/joint.css" media="screen" type="text/css" rel="stylesheet" />',
    '<link href="form.css?ver='. filemtime('form.css'). '" media="screen" type="text/css" rel="stylesheet" />',
];
get_smartadmin_header($css);
get_smartadmin_body_header();
?>

<div id="content">
  <div class="row">
  </div>
  <section id="widget-grid" class="">
    <div class="row">
      <article class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <div class="jarviswidget" id="wid-id-0">
          <header>
            <span class="widget-icon"> <i class="fa fa-table"></i> </span>
            <h2><strong>Title</strong> <i>Change</i></h2>
          </header>
          <div>
            <div class="jarviswidget-editbox"></div>
            <div class="widget-body">
              <div id="mermaid-view" class="table-responsive"></div>
            </div>
          </div>
        </div>
      </article>
      <article class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
        <div class="jarviswidget" id="wid-id-0">
          <header>
            <span class="widget-icon"> <i class="fa fa-table"></i> </span>
            <h2><strong>Title</strong> <i>Change</i></h2>
          </header>
          <div>
            <div class="jarviswidget-editbox"></div>
            <div class="widget-body">
              <div id="action-form" class="table-responsive"></div>
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
#   '<script src="react-0.14.3.js"></script>',
#   '<script src="react-dom-0.14.3.js"></script>',
#   '<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"></script>',
    
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react-with-addons.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/JSXTransformer.js"></script>',

    '<script src="http://www.jointjs.com/js/vendor/lodash/lodash.min.js"></script>',
    '<script src="http://www.jointjs.com/js/vendor/backbone/backbone-min.js"></script>',
    '<script src="http://www.jointjs.com/downloads/joint.js"></script>',

    '<script src="js/trans.js?ver='. filemtime('js/trans.js'). '"></script>',
    '<script src="js/AbstractBase.js?ver='. filemtime('js/AbstractBase.js'). '" type="text/jsx;harmony=true"></script>',
    '<script src="js/Form.js?ver='. filemtime('js/Form.js'). '" type="text/jsx;harmony=true"></script>',
    '<script src="js/ActionConditionForm.js?ver='. filemtime('js/ActionConditionForm.js'). '" type="text/jsx;harmony=true"></script>',
    '<script src="js/ActionConditionFormEdit.js?ver='. filemtime('js/ActionConditionFormEdit.js'). '" type="text/jsx;harmony=true"></script>',
    '<script src="js/app2.js?ver='. filemtime('js/app2.js'). '" type="text/jsx;harmony=true"></script>',

#   '<script src="app.js" type="text/babel"></script>',
#   '<script src="Form.js?ver='. filemtime('Form.js'). '" type="text/babel"></script>',
#   '<script src="ActionConditionForm.js?ver='. filemtime('ActionConditionForm.js'). '" type="text/babel"></script>',
];

get_smartadmin_footer($jss);
