<?php

require_once "/var/www/html/libs/common.php";
require_once( "../wp-blog-header.php" );

session_start();
preload_libraries();
# get_dailymotion_pre_header();
# get_jQuery_EasyUI_header();

ini_set('display_errors', 1);

use timomo\Models\Common\Tweet;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Database\Eloquent\Collection;

$parser = new \Symfony\Component\Serializer\Encoder\JsonDecode();

$limit = (int) $_SESSION["common"]["per_page"];
$page = (int) $_REQUEST["page"];
$limit = $limit === 0 ? 10 : $limit;
$page = $page === 0 ? 1 : $page;
$pageLimit = 500;

// tweets
// page: 10
// limit: 100
// total: 1000
// 多めに取る
// 101...110
// limit * (page番号 - 1) + 1 ... start
// limit * page番号 + 1 ... end
// 先読みpage + limit * (page番号 - 1)

$query = Tweet::orderBy('timestamp_ms', 'desc');
$query->orderBy('id_str', 'desc');
$query->skip($limit * ($page - 1));
$query->take($pageLimit);
$collection = $query->get();
$total = $collection->count() + ($limit * ($page - 1));

$options = [];
$items = new Collection;

$slice = $collection->slice(1, $limit);

foreach($collection as $tweet) {
    $tmp = $tweet->toArray();
    $mixed = $parser->decode($tweet->data, "json");
    $tmp['data'] = $mixed;
    $tmp['data_short'] = mb_substr($tweet->data, 0, 100);
    $items->push($tmp);
}

$tweets = new LengthAwarePaginator(
    $items, $total, $limit, $page, $options
);

header("Content-Type: text/javascript; charset=utf-8");
header("X-Total-Count: ". $total);
print $items->toJson();
exit(0);

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

$rows = [];

# sleep(10);

foreach( $pagerfanta->getCurrentPageResults() as $data ) {
    $mixed = $parser->decode( $data->data, "json" );
    $tmp = $data->toArray();
    $tmp = [
        "id_str" => $data->id_str,
        "timestamp_ms" => $data->timestamp_ms,
        "data" => $mixed,
    ];
    $rows[] = $tmp;
}

$output = [
    'rows' => $rows,
    'total' => $pagerfanta->count(),
];

header("Content-Type: text/javascript; charset=utf-8");

print json_encode($output, JSON_PRETTY_PRINT);
