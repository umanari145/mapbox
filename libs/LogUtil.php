<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\LineFormatter;

/**
 * LogUtilはログのラッパー
 */
class LogUtil
{

    private $logging_path;

    private $error_logging_path;

    public $logger;

    public $error_logger;

    public function __construct(string $logHandleName = '')
    {
        $this->makeLogDir();
        $this->setBasicConfig($logHandleName);
    }

    public function makeLogDir()
    {
        $logging_dir = dirname(__DIR__) . '/logs';
        $this->logging_path = sprintf('%s/%s', $logging_dir, 'access_' . date('Y-m-d') .'.log');
        $this->error_logging_path = sprintf('%s/%s', $logging_dir, 'error_' . date('Y-m-d') .'.log');
        if (!file_exists($logging_dir)) {
            mkdir($logging_dir, '777');
        }
    }

    public function setBasicConfig(string $logHandleName = '')
    {
        $stream = new StreamHandler($this->logging_path, Logger::INFO);
        $logger = new Logger($logHandleName);
        $logger->pushHandler($stream);
        $this->logger = $logger;

        $alertStream = new StreamHandler($this->error_logging_path, Logger::WARNING);
        $error_logger = new Logger($logHandleName . '_error');
        $error_logger->pushHandler($alertStream);
        $this->error_logger = $error_logger;
    }
}
