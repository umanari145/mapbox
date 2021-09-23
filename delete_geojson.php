<?php

require_once __DIR__ . "./entry.php";
require_once __DIR__ . "/Service/StoreService.php";

header("Content-Type: application/json; charset=UTF-8");
$postData = json_decode(file_get_contents("php://input"), true);
$deleteId = @$postData["id"]?:"";
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
