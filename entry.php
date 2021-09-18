<?php

/**
 * すべてのエントリーポイント
 * 
 */
require_once __DIR__ .'/vendor/autoload.php';
//ライブラリの読み込み
require_once __DIR__ .'/libs/Database.php';
require_once __DIR__ .'/libs/LogUtil.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();