<?php

require_once "/var/www/html/libs/common.php";
require_once( "../wp-blog-header.php" );

session_start();
preload_libraries();
# get_dailymotion_pre_header();
get_jQuery_EasyUI_header();

try {
    $pdo_queue_db = new PDO( "mysql:unix_socket=/tmp/mysql_q4m.sock;dbname=queue_db", "root", "manamana", array( PDO::ATTR_PERSISTENT => false ) );
    $fpdo_queue_db   = new FluentPDO( $pdo_queue_db );
} catch ( PDOException $e ) {
    echo $e->getMessage();
    exit;
}

$query_queue_url = $fpdo_queue_db->from( "queue_url" );

$adapter = new Pagerfanta\Adapter\FluentPDO\SelectQueryAdapter( $query_queue_url );
$pagerfanta = new Pagerfanta\Pagerfanta( $adapter );

$pagerfanta->setMaxPerPage( $_SESSION["common"]["per_page"] );
if ( $_REQUEST["page"] != "" ):
    if ( $_REQUEST["page"] == 0 ) $_REQUEST["page"] = 1;
    $pagerfanta->setCurrentPage( $_REQUEST["page"] );
endif;

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

<?php

get_jQuery_EasyUI_footer();

function show_custom_thumb_list() {
   global $pagerfanta;
?>
    <?php show_pagination( $pagerfanta ) ?>

    <table class="easyui-datagrid" data-options="" style="height: 500px;">
        <thead frozen="true">
            <tr>
                <th field="check"></th>
                <th field="id_str" width="">id_str</th>
                <th field="site_type" width="60">site_type</th>
                <th field="actress_id" width="70">actress_id</th>
                <th field="thumb" width="70">thumb</th>
                <th field="uri" width="150">uri</th>
                <th field="finished">finished</th>
                <th field="free">free</th>
                <th field="recording_time">recording_time</th>
                <th field="created_at">created_at</th>
            </tr>
        </thead>
        <tbody>
<?php
foreach( $pagerfanta->getCurrentPageResults() as $queue_url ):
?>
            <tr>
                <td><input type="checkbox" name="queue_url_id[]" value="<?php echo $queue_url["id_str"] ?>"<?php echo $flag ?> /></td>
                <td><?php echo $queue_url["id_str"] ?></td>
                <td><?php echo $queue_url["site_type"] ?></td>
                <td><?php echo $queue_url["actress_id"] ?></td>
                <td><img src="<?php echo $queue_url["thumb"] ?>" style="max-height: 40px;" /></td>
                <td><a target="_blank" href="<?php echo $queue_url["uri"] ?>" title="<?php echo $queue_url["uri"] ?>"><?php echo $queue_url["uri"] ?></a></td>
                <td><?php echo $queue_url["finished"] ?></td>
                <td><?php echo $queue_url["free"] ?></td>
                <td><?php echo $queue_url["recording_time"] ?></td>
                <td><?php echo date( DATE_ATOM, $queue_url["created_at"] ) ?></td>
            </tr>
<?php
endforeach;
?>
        </tbody>
    </table>
<?php
}

