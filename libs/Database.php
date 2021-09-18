<?php


class Database
{

    private $logUtil;

    public function __construct(LogUtil $logUtil)
    {
        $this->logUtil = $logUtil;
        $this->connect();
    }


    public function connect()
    {
        try {
            //メインのDB
            ORM::configure(sprintf('%s:Server=%s,%d;Database=%s', $_ENV['DB_DSN'], $_ENV['DB_HOST'], $_ENV['DB_PORT'], $_ENV['DB_NAME']));
            ORM::configure('username', $_ENV['DB_USER']);
            ORM::configure('password', $_ENV['DB_PASS']);
            ORM::configure('driver_options', array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));
            ORM::configure('logging', true);
            ORM::configure('logger', function ($log_string) {
                $this->logUtil->logger->Info(sprintf('%s::%s', 'SQL', $log_string));
            });
        } catch (Exception $e) {
            $this->logUtil->error_logger->error(sprintf('DBエラー::%s', $e->getMessage()));
        }
   
    }
   
}

