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

    public function getJson():string
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

        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    public function getStore(): array
    {
        try {
            $query = ORM::for_table('store')
                ->raw_query('SELECT id,store_name,geometry_type,store_position.STAsText() as store_position FROM store');
            $data = $query->find_array();
            $convArr = $this->parseGeoData($data);
            return $convArr;
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

    public function insertStore(array $sqlHashList)
    {
        try {
            foreach ($sqlHashList as $eachGeo) {
                $store = ORM::for_table('store')->create();
                $store->geometry_type = $eachGeo['geometry_type'];
                $store->set_expr('store_position', $eachGeo['geometry']);
                $store->save();
            }
        } catch (Exception $e) {
            $this->logUtil->error_logger->error(sprintf('DBエラーメッセージ::%s', $e->getMessage()));
            $this->logUtil->error_logger->error(sprintf('stack_trace::%s', $e->getTraceAsString()));
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