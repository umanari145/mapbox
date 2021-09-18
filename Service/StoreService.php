<?php

require_once dirname(__DIR__) . "/entry.php";

class StoreService
{
    private $logUtil;

    private $database;

    public function __construct(LogUtil $logUtil, Database $database)
    {
        $this->logUtil = $logUtil;
        $this->database = $database;
    }

    public function getStore()
    {
        try {
            $query = ORM::for_table('store')->select_many('id', 'store_name');
            $datas = $query->find_array();
            return $datas;
        } catch (Exception $e) {
            $this->logUtil->error_logger->error(sprintf('DBエラーメッセージ::%s', $e->getMessage()));
            $this->logUtil->error_logger->error(sprintf('stack_trace::%s', $e->getTraceAsString()));
        }
    }
}