<?php

require_once dirname(__DIR__) . "/entry.php";

class Database
{

    public function __construct()
    {
        try {
            //メインのDB
            ORM::configure(sprintf('%s:Server=%s,%d;Database=%s', $_ENV['DB_DSN'], $_ENV['DB_HOST'], $_ENV['DB_PORT'], $_ENV['DB_NAME']));
            ORM::configure('username', $_ENV['DB_USER']);
            ORM::configure('password', $_ENV['DB_PASS']);
            //ORM::configure('driver_options', array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));
            ORM::configure('logging', true);
            /*ORM::configure('logger', function ($log_string) use ($logger) {
                $logger->addInfo('sql ' . $log_string);
            });*/
        } catch (Exception $e) {
            echo "aaaaa";
            var_dump($e->getMessage());
            //$app->halt(500, $e->getMessage());
        }
   
    }

    public function select()
    {
        $query = ORM::for_table('store')
                ->select_many('id', 'store_name');
        $datas = $query->find_array();
        var_dump($datas);
    }
    
    
}

