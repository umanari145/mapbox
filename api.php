<?php

require_once __DIR__ . "./entry.php";
require_once __DIR__ . "./Service/StoreService.php";

header("Content-Type: application/json; charset=UTF-8");
$logUtil = new LogUtil();
$database = new Database($logUtil);

$storeService = new StoreService($logUtil, $database);
$data = $storeService->getJson();
echo json_encode($data, JSON_UNESCAPED_UNICODE);
