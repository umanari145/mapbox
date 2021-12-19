<?php

/**
 * すべてのエントリーポイント
 * 
 */
require_once __DIR__ .'/vendor/autoload.php';
//ライブラリの読み込み
require_once __DIR__ .'/libs/Database.php';
require_once __DIR__ .'/libs/LogUtil.php';

if (!empty($_SERVER['SERVER_NAME']) && $_SERVER['SERVER_NAME'] === 'localhost') {
    require_once __DIR__ .'/load_environment.php';
}