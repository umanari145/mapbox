<?php

require_once __DIR__ . "./entry.php";
require_once __DIR__ . "/libs/Database.php";

header('Content-type: application/json; charset= UTF-8');
$post_data = json_decode(file_get_contents("php://input"), true);

$featureList = $post_data['featureList'];
if (!empty($featureList)) {
    file_put_contents("json/feature.json", json_encode($featureList), JSON_UNESCAPED_UNICODE);
}