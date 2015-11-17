<?php

require_once "/var/www/html/libs/common.php";
require_once( "../wp-blog-header.php" );

session_start();
preload_libraries();
# get_dailymotion_pre_header();
get_jQuery_EasyUI_header();

?>
<form action="" method="post">

<div id="main-layout" class="easyui-layout" style="height:580px">
    <div title="コントロールパネル" style="width:350px;" data-options="
        region: 'east',
        iconCls: 'icon-search',
        split: true,
        border: true,
     ">
        <div class="easyui-layout" style="" id="inner-control-panel-layout" data-options="
            fit: true,
        ">
            <div style="height:150px;" title="" data-options="
                region: 'north',
                split: true,
            ">
            </div><!-- north //-->
            <div style="height:220px;" title="イニシャル" data-options="
                region: 'center',
                split: true,
                iconCls: 'icon-search',
            ">
            </div><!-- center //-->
            <div style="height:220px;" title="セッション情報" data-options="
                region: 'south',
                split: true,
                iconCls: 'icon-search',
            ">
                <pre><?php echo var_dump( $_SESSION ) ?></pre>
            </div><!-- south //-->
        </div><!-- div#inner-control-panel-layout //-->
    </div><!-- east //-->
    <div class="easyui-layout" style="" id="inner-list-box" data-options="
        fit: true,
    ">
        <div id="custom_thumb_list" title="Crawler Queue" data-options="
            region: 'center',
        ">
            <?php show_custom_thumb_list() ?>
        </div><!-- div#custom_thumb_list //-->
    </div><!-- div#inner-list-box //-->
</div> <!-- div#main-layout //-->

</form>

<div id="aquarium"></div>

<script>
jQuery( "#tweet_table_detail" ).hide();
jQuery( "#tweet_table" ).datagrid( {
    onDblClickCell: function( index, field, value ) {
        if( field == "data" ) {
            jQuery( "#tweet_table_detail" ).show();
            jQuery( "#tweet_table_detail" ).dialog( {
                title: 'test',
                width: 500,
                height: 500,
                closed: false,
                cache: false,
                modal: true
            } );
            jQuery( "#tweet_table_detail_textarea" ).html( value );
        }
    },
} );
</script>
<script src="bundle.js"></script>

<?php

get_jQuery_EasyUI_footer();

function show_custom_thumb_list() {
?>
    <?php # show_pagination( $pagerfanta ) ?>
    <div id="tweet_table_container"></div>
    <div id="tweet_table_detail">
        <textarea id="tweet_table_detail_textarea" style="height: 450px; width: 450px;" class="textbox-text validatebox-text textbox-prompt"></textarea>
    </div>
<?php
}

