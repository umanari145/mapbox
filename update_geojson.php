<?php

require_once __DIR__ . "/entry.php";
require_once __DIR__ . "/Service/StoreService.php";

header("Content-Type: application/json; charset=UTF-8");
$logUtil = new LogUtil();
$database = new Database($logUtil);

$postData = json_decode(file_get_contents("php://input"), true);

$storeService = new StoreService($logUtil, $database);
//jsonのレスポンス
echo $storeService->addGeoJson($postData);
