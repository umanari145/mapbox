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

    public function getJson($params = null):array
    {
        $data = null;
        switch ($this->resMode) {
            case 'database':
                $data = $this->getStore($params);
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
        $res = null;
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
        $sqlData = $this->singleMakeGeometry($geoJson);
        //変換処理が入ったときに追加
        //$this->makeSQLHashList([$sqlData]);
        return $this->insertStore([$sqlData]);
    }

    private function parseGeoJson(array $jsonData): array
    {
        $featuresList = $jsonData['features'];
        $sqlArr = [];
        foreach ($featuresList as $index => $feature) {
            $sqlArr[] = $this->singleMakeGeometry($feature);
        }
        return $sqlArr;
    }

    private function singleMakeGeometry(array $feature): array
    {
        $sqlData = null;
        switch ($feature['geometry']['type']) {
            case 'Point':
                $geoPoint = $feature['geometry']['coordinates'];
                $sqlData = [
                    'geometry_type' => 1,
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
                    'geometry' => sprintf("geometry::STPolyFromText('POLYGON((%s))', %d)", implode(",", $startPoly), 4326)
                ];
                break;
            case 'MultiPolygon':
                $geos = $feature['geometry']['coordinates'];
                $multiPolygonStr = $this->makeMultiPolyStr($geos);
                $sqlData = [
                    'geometry_type' => 3,
                    'geometry' => sprintf("geometry::STMPolyFromText('%s', %d)", $multiPolygonStr, 4326)
                ];
                break;
        }
        return $sqlData;
    }

    public function makeMultiPolyStr($geos): string
    {
        $multiPolygonArr = [];
        foreach ($geos as $eachPolyList) {
            $polygonStr = $this->makePolyArr($eachPolyList);
            $multiPolygonArr[] = $polygonStr;
        }
        $multiPolygonStr = implode(",", $multiPolygonArr);
        return sprintf('MULTIPOLYGON(%s)', $multiPolygonStr);
    }

    public function makePolyArr($polyList): string
    {
        $polyArr = [];
        foreach ($polyList as $polygon) {
            //これが1ポリゴン
            $v2 = array_map(function ($v) {
                return sprintf("%s", implode(" ", $v));
            }, $polygon);
            $nanoPolygon = sprintf('(%s)', implode(",", $v2));
            $polyArr[] = $nanoPolygon;
        }
        $singlePolygon = implode(',', $polyArr);
        return sprintf("(%s)", $singlePolygon);
    }

    public function getStore($params = null): array
    {
        try {
            $sql = $this->makeSQL($params);
            $query = ORM::for_table('store')
                ->raw_query($sql);
            $data = $query->find_array();
            $data = $this->parseGeoData($data);
            return $data;
        } catch (Exception $e) {
            $this->logUtil->error_logger->error(sprintf('DBエラーメッセージ::%s', $e->getMessage()));
            $this->logUtil->error_logger->error(sprintf('stack_trace::%s', $e->getTraceAsString()));
            return [];
        }
    }

    public function makeSQL($params):string
    {
        $sql = <<< EOF
        SELECT 
          id,
          store_name,
          geometry_type,
          store_position.STAsText() as store_position
        FROM
          store
EOF;

        if (!empty($params)) {
            $rangeType;
            $rangeType = @$params['range_type']?:'';
            switch ($rangeType) {
                case 'square':

                    break;
            }
        }
        return $sql;
    }

    public function makeGEO($params)
    {
        
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
                $store->set_expr('store_position', $eachGeo['geometry']);
                $store->save();

                $storeName = sprintf("store_name_%s", $store->id);
                $store->store_name = $storeName;
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

    public function insertDummyGeoJson(int $dataVolume)
    {
        try {
            $this->makeDummyData($dataVolume);
            return true;
        } catch (Exception $e) {
            $this->logUtil->error_logger->error(sprintf('DBエラーメッセージ::%s', $e->getMessage()));
            $this->logUtil->error_logger->error(sprintf('stack_trace::%s', $e->getTraceAsString()));
            return false;
        }
    }

    private function makeDummyData(int $dataVolume)
    {
        $faker = \Faker\Factory::create();

        $dataList = [];
        for ($i = 1; $i <= $dataVolume; $i++) {
            
            $data = [
                sprintf("'sample_store _%08d'", $i),
                sprintf("'POINT(%s %s)'", $faker->longitude(139.7, 140.7), $faker->latitude(35.1, 35.7)),
                1
            ];

            $dataList[] = sprintf("(%s)", implode(",", $data));
            if (count($dataList) === 1000) {
                $this->insertData($dataList);
                $dataList = [];
                echo "process $i\n";
            }
        }
    }

    private function insertData(array $dataList)
    {
        $columns = ["store_name", "store_position", "geometry_type"];
        $sql = sprintf("INSERT INTO store (%s) VALUES %s", implode(",", $columns), implode(",", $dataList));
        return ORM::raw_execute($sql);
    }


}