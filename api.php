<?php


require_once __DIR__ . "./entry.php";
require_once __DIR__ . "/libs/Database.php";

$db = new Database();
$db->select();

exit();
$features = json_decode(file_get_contents("json/feature.json"), true);


echo json_encode($features, JSON_UNESCAPED_UNICODE);