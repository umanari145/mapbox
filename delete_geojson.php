<?php

require_once __DIR__ . "./entry.php";
require_once __DIR__ . "/Service/StoreService.php";

header("Content-Type: application/json; charset=UTF-8");
$deleteId = @$_POST["id"]?:"";
$res = false;
if (!empty($deleteId)) {
    $logUtil = new LogUtil();
    $database = new Database($logUtil);
    $storeService = new StoreService($logUtil, $database);
    $res = $storeService->deleteStore($deleteId);
    if ($res) {
        echo json_encode([
            'res' => true,
            'data' => $storeService->getJson()
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'res' => false
        ]);
    }
} else {
    echo json_encode([
        'res' => false
    ]);
}
