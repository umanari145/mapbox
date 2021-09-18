<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Display a map on a webpage</title>
<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
<link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
<script
  src="https://code.jquery.com/jquery-2.2.4.min.js"
  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
  crossorigin="anonymous"></script>
<style>

body { margin: 0; padding: 0; }
#map { position: absolute; top: 0; bottom: 0; width: 70%; }
#white_block { 
    position: absolute; 
    top:0; 
    left:70%;
    bottom: 0; 
    width: 30%; 
    padding: 30px 0 0 40px;
}
</style>
</head>
<body>
<div id="map"></div>

<div id="white_block">
    <div>
        <button id="clear">クリア</button>
        <div id="input_box" style="min-height:200px;">

        </div>
    </div>
    <div style="margin-top:20px;">
        <textarea cols="50" rows="8" id="polygon_txt"></textarea>
        <div>
            <button id="update_polygon">ポリゴン作成</button>        
            <button id="persist_polygon" style="margin-left:20px;">ポリゴン更新</button>
        </div>
    </div>
    <div style="margin-top:20px;">
        <textarea cols="50" rows="2" id="pin_txt"></textarea>
        <div>
            <button id="update_pin">ピン作成</button>        
            <button id="persist_pin" style="margin-left:20px;">ピン更新</button>
        </div>
    </div>
    
</div>
<script src="/mapbox.js"></script>
</body>
</html>