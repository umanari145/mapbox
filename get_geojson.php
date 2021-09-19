<?php

require_once __DIR__ . "./entry.php";
require_once __DIR__ . "/Service/StoreService.php";

$logUtil = new LogUtil();
$database = new Database($logUtil);

$storeService = new StoreService($logUtil, $database);

var_dump($storeService->getStore());
