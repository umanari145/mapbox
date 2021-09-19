<?php

require_once __DIR__ . "./entry.php";
require_once __DIR__ . "/Service/StoreService.php";

$logUtil = new LogUtil();
$database = new Database($logUtil);

$storeService = new StoreService($logUtil, $database);

$insGeo = new InsertGeometry($storeService);
$insGeo->loadGeoJson();

/**
 * InsertGeometryはgeometry情報のinsert
 */
class InsertGeometry
{

    private $storeService;

    public function __construct(StoreService $storeService)
    {
        $this->storeService = $storeService;
    }

    public function loadGeoJson()
    {
        $filePath = __DIR__ . '/json/feature.json';
        $res = file_get_contents($filePath);
        if (!empty($res)) {
            $jsonData = json_decode($res, true);
            $sqlHashList = $this->parseGeoJson($jsonData);
            $this->makeSQLHashList($sqlHashList);
            $this->storeService->insertStore($sqlHashList);
        }
    }

    private function parseGeoJson(array $jsonData): array
    {
        $featuresList = $jsonData['features'];
        $sqlArr = [];
        foreach ($featuresList as $feature) {
            switch ($feature['geometry']['type']) {
                case 'Point':
                    $geoPoint = $feature['geometry']['coordinates'];
                    $sqlArr[] = [
                        'geometry_type' => 1,
                        'geometry' => sprintf("geometry::STPointFromText('POINT(%s)', %d)", implode(" ", $geoPoint), 4326)
                    ];
                    break;
                case 'Polygon':
                    $v = array_map(function ($v) {
                        return sprintf("%s", implode(" ", $v));
                    }, $feature['geometry']['coordinates'][0]);
                    $sqlArr[] = [
                        'geometry_type' => 2,
                        'geometry' => sprintf("geometry::STPolyFromText('POLYGON((%s))', %d)", implode(",", $v), 4326)
                    ];
                    break;
            }
        }
        return $sqlArr;
    }

    private function makeSQLHashList(array $sqlHashList)
    {
        foreach ($sqlHashList as &$eachHash) {
            //入れたくなったらここにhashの各要素を入れる
        }


    }

}
