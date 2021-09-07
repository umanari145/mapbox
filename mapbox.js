$(function(){
    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0c3Vtb3RvLW5vcmlvIiwiYSI6ImNrcXA4M2E4ODBzMHUyd3IxaWJ2bzJ2bXMifQ.xIXNRnsx4lFOTRWYvskLwg';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [140.048983, 35.707347], // starting position
        zoom: 18 // starting zoom
    });

    map.on('load', function () {

        $.ajax({
            url:"http://localhost:8000/api.php",
            type:"GET"
        }).done(function(res){
            var featureList = JSON.parse(res);
            renderingMap(featureList);
        }).fail(function(res){
            console.log(fail)
        })

        function renderingMap(res)
        {
            // ポリゴン設定
            map.addSource('polygon_sample', {
                type: 'geojson',
                data: res
            });

            // スタイル設定
            map.addLayer({
                "id": "polygon_sample",
                "type": "fill",
                "source": "polygon_sample",
                "layout": {},
                "paint": {
                    'fill-color': '#E92D63',
                    'fill-opacity': 0.4
                }
            });
        }

        map.on('click', (e) => {
            const lat = e.lngLat.lat;
            const lng = e.lngLat.lng;
            var latlon = "[" + lng + "," + lat + "]," + "<br>"
            $("#input_box").append(latlon);
        });


    });

    $("#input_box").click(function(){
        $("#input_box").html("")
    })

})
 