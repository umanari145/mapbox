<?php

require_once dirname(__DIR__) . "/entry.php";

class StoreService
{
    private $logUtil;

    private $database;

    private $resMode;

    public function __construct(LogUtil $logUtil, Database $database, string $resMode = "database")
    {
        $this->logUtil = $logUtil;
        $this->database = $database;
        $this->resMode = $resMode;
    }

    public function getJson():array
    {
        $data = null;
        switch ($this->resMode) {
            case 'database':
                $data = $this->getStore();
                break;
            case 'file':
                $data = file_get_contents("json/feature.json");
                $data = json_decode($data, true);
                break;
        }

        return $data;
    }

    public function loadGeoJson()
    {
        $filePath = dirname(__DIR__) . '/json/feature.json';
        $res = file_get_contents($filePath);
        if (!empty($res)) {
            $jsonData = json_decode($res, true);
            $sqlHashList = $this->parseGeoJson($jsonData);
            //変換処理
            //$this->makeSQLHashList($sqlHashList);
            $this->insertStore($sqlHashList);
        }
    }

    public function addGeoJson(array $geoJson)
    {
        if (!empty($geoJson)) {
            switch ($this->resMode) {
                case 'database':
                    $res = $this->insertGeoJsonDB($geoJson);
                    break;
                case 'file':
                    $data = file_get_contents("json/feature.json");
                    $data = json_decode($data, true);
                    break;
            }
        }
        return json_encode(['res' => $res, 'data' => $this->getJson()], JSON_UNESCAPED_UNICODE);
    }

    private function insertGeoJsonDB(array $geoJson):bool
    {
        $max = $this->getStore('max');
        $sqlData = $this->singleMakeGeometry($geoJson, $max[0]["max"]);
        //変換処理が入ったときに追加
        //$this->makeSQLHashList([$sqlData]);
        return $this->insertStore([$sqlData]);
    }

    private function parseGeoJson(array $jsonData): array
    {
        $featuresList = $jsonData['features'];
        $sqlArr = [];
        foreach ($featuresList as $index => $feature) {
            $sqlArr[] = $this->singleMakeGeometry($feature, $index);
        }
        return $sqlArr;
    }

    private function singleMakeGeometry(array $feature, int $index): array
    {
        $sqlData = null;
        switch ($feature['geometry']['type']) {
            case 'Point':
                $geoPoint = $feature['geometry']['coordinates'];
                $sqlData = [
                    'geometry_type' => 1,
                    'store_name' => 'store_name_' . ($index + 1),
                    'geometry' => sprintf("geometry::STPointFromText('POINT(%s)', %d)", implode(" ", $geoPoint), 4326)
                ];
                break;
            case 'Polygon':
                $v = array_map(function ($v) {
                    return sprintf("%s", implode(" ", $v));
                }, $feature['geometry']['coordinates'][0]);
                
                $startPoly = $v;
                //polygonは始点と終点が同じでないとダメ
                $startPoly[] = $v[0];
                $sqlData = [
                    'geometry_type' => 2,
                    'store_name' => 'store_name_' . ($index + 1),
                    'geometry' => sprintf("geometry::STPolyFromText('POLYGON((%s))', %d)", implode(",", $startPoly), 4326)
                ];
                break;
        }
        return $sqlData;
    }

    public function getStore($type = 'select'): array
    {
        try {
            $col;
            switch ($type) {
                case 'select':
                    $col = 'id,store_name,geometry_type,store_position.STAsText() as store_position';
                    $query = ORM::for_table('store')
                        ->raw_query('SELECT ' . $col . ' FROM store');
                    $data = $query->find_array();
                    $data = $this->parseGeoData($data);
                    break;
                case 'max':
                    $col = 'MAX(id) as max';
                    $query = ORM::for_table('store')
                        ->raw_query('SELECT ' . $col . ' FROM store');
                    $data = $query->find_array();
                    break;
            }
            return $data;
        } catch (Exception $e) {
            $this->logUtil->error_logger->error(sprintf('DBエラーメッセージ::%s', $e->getMessage()));
            $this->logUtil->error_logger->error(sprintf('stack_trace::%s', $e->getTraceAsString()));
        }
    }

    public function parseGeoData(array $data)
    {
        $items = [];
        foreach ($data as $eachData) {
            $geometry = geoPHP::load($eachData['store_position'], 'wkt');
            $polyType = $geometry->geometryType();
            $cordinates = $geometry->asArray();
            $properties = [
                'id' => $eachData['id'],
                'store_name' => $eachData['store_name']
            ];
            $items[] = $this->convertGeo($polyType, $cordinates, $properties);
        }

        $features = [
            "type" => "FeatureCollection",
            "features" => $items
        ];

        return $features;
    }

    private function convertGeo(string $polyType, array $cordinates, array $properties): array
    {
        $eachGeo = [
            "type" => "Feature",
            "geometry" => [
                "type" => $polyType,
                "coordinates" => $cordinates,
            ],
            "properties" => $properties
        ];
        return $eachGeo;
    }

    public function insertStore(array $sqlHashList):bool
    {
        try {
            foreach ($sqlHashList as $eachGeo) {
                $store = ORM::for_table('store')->create();
                $store->geometry_type = $eachGeo['geometry_type'];
                $store->store_name = $eachGeo['store_name'];
                $store->set_expr('store_position', $eachGeo['geometry']);
                $store->save();
            }
            return true;
        } catch (Exception $e) {
            $this->logUtil->error_logger->error(sprintf('DBエラーメッセージ::%s', $e->getMessage()));
            $this->logUtil->error_logger->error(sprintf('stack_trace::%s', $e->getTraceAsString()));
            return false;
        }
    }

    public function deleteStore(string $deleteId): bool
    {
        try {
            $person = ORM::for_table('store')
            ->where_equal('id', $deleteId)
            ->delete_many();
            return true;
        } catch (Exception $e) {
            $this->logUtil->error_logger->error(sprintf('DBエラーメッセージ::%s', $e->getMessage()));
            $this->logUtil->error_logger->error(sprintf('stack_trace::%s', $e->getTraceAsString()));
            return false;
        }
    }

}