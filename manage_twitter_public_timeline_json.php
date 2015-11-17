<?php

require_once "/var/www/html/libs/common.php";
require_once( "../wp-blog-header.php" );

session_start();
preload_libraries();
# get_dailymotion_pre_header();
# get_jQuery_EasyUI_header();

use timomo\Models\Common\Tweet;

$tweets = Tweet::orderBy("timestamp_ms", "desc");
$adapter = new Pagerfanta\Adapter\Laravel\SelectQueryAdapter( $tweets );
$pagerfanta = new Pagerfanta\Pagerfanta( $adapter );
$parser = new \Symfony\Component\Serializer\Encoder\JsonDecode();

# echo "<pre>";
# var_dump($tweets);
# echo "</pre>";
# exit(0);

$pagerfanta->setMaxPerPage( $_SESSION["common"]["per_page"] );
if ( $_REQUEST["page"] != "" ):
    if ( $_REQUEST["page"] == 0 ) $_REQUEST["page"] = 1;
    $pagerfanta->setCurrentPage( $_REQUEST["page"] );
endif;

$output = [];

# sleep(10);

foreach( $pagerfanta->getCurrentPageResults() as $data ) {
    $mixed = $parser->decode( $data->data, "json" );
    $tmp = $data->toArray();
    $tmp = [
        "id_str" => $data->id_str,
        "timestamp_ms" => $data->timestamp_ms,
        "data" => $mixed,
    ];
    $output[] = $tmp;
}

header("Content-Type: text/javascript; charset=utf-8");

print json_encode($output, JSON_PRETTY_PRINT);
