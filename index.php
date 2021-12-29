<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Display a map on a webpage</title>
<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
<link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet">
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
.mapboxgl-popup {
    max-width: 400px;
}
.mini{
    width:80%;
}

#range_circle {
    display:none;
}
</style>
</head>
<body>
<div id="map"></div>

<div id="white_block">
    <div>
        <button id="clear">クリア</button>
        <div id="input_box" style="min-height:150px;">

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

    <div style="margin-top:20px;">
        <input type="radio" name="range" value="1" id="range_1" class="range_input" checked><label for="range_1">四隅</label>
        <input type="radio" name="range" value="2" id="range_2" class="range_input"><label for="range_2">円</label>
        <div style="margin-top:10px;" id="range_square">
            <div>
                <label >左上</label><input type="text" name="lulonlat" value="" class="mini">
            </div>
            <div style="margin-top:10px;">
                <label >右下</label><input type="text" name="rdlonlat" value="" class="mini">
            </div>
        </div>
            
        <div style="margin-top:10px;" id="range_circle">
            <div>
                <label >中心点</label><input type="text" name="center" value="" class="mini">
            </div>
            <div style="margin-top:10px;">
                <label >半径(m)</label><input type="text" name="distance" value="" style="width:50px;">
            </div>
        </div>
        <div style="margin-top:10px;">
            <button id="range_hanei">範囲反映</button>      
        </div>
        <div style="margin-top:10px;" id="sql_disp">

        </div>
    </div>
    
</div>
<script src="/js/dist/app.js"></script>
</body>
</html>