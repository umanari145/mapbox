<?php


$features = json_decode(file_get_contents("json/feature.json"), true);


echo json_encode($features, JSON_UNESCAPED_UNICODE);