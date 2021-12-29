<?php

/**
 * jsonファイルを直接入れる(バッチ系のプログラム)
 */
require_once __DIR__ . "/entry.php";
require_once __DIR__ . "/load_environment.php";
require_once __DIR__ . "/Service/StoreService.php";

$logUtil = new LogUtil();
$database = new Database($logUtil);

$storeService = new StoreService($logUtil, $database);

$storeService->insertDummyGeoJson(100000);
