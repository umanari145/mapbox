$(function(){
    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0c3Vtb3RvLW5vcmlvIiwiYSI6ImNrcXA4M2E4ODBzMHUyd3IxaWJ2bzJ2bXMifQ.xIXNRnsx4lFOTRWYvskLwg';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [140.0205937617735,35.6917560333537], // starting position
        zoom: 18 // starting zoom
    });

    map.on('load', function () {

        $.ajax({
            url:"/api.php",
            type:"GET"
        }).done(function(res){
            var featureList = JSON.parse(res);
            renderingMap(featureList);
        }).fail(function(res){
            console.log("--fail--")
            console.log(res)
        })

        function renderingMap(res)
        {
            // ポリゴン設定
            map.addSource('plot', {
                type: 'geojson',
                data: res
            });

            // スタイル設定
            map.addLayer({
                "id": "polygon_sample",
                "type":"fill",
                "source": "plot",
                "layout": {},
                "filter": ['==', '$type', 'Polygon'],
                "paint": {
                    'fill-color': '#E92D63',
                    'fill-opacity': 0.4,
                }
            });

            map.addLayer({
                "id": "pin_sample",
                "type":"circle",
                "source": "plot",
                "layout": {},
                "filter": ['==', '$type', 'Point'],
                "paint": {
                    'circle-color': '#e55e5e',
                    'circle-radius': 10,
                }
            })
            
        }

        map.on('click', (e) => {
            const lat = e.lngLat.lat;
            const lng = e.lngLat.lng;
            var latlon = "[" + lng + "," + lat + "]," + "<br>"
            $("#input_box").append(latlon);
        });
    });

    $("#clear").click(function(){
        $("#input_box").html("")
    })


    $("#kousin").click(function(){
        map.getSource('plot').setData({
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [[
                [140.0225466840701,35.69208292162499],
                [140.02261111622886,35.69189976819858],
                [140.0230420062971,35.691893226997095],
                [140.02305408732724,35.6920992745885]
              ]]
            },
            "properties": {
              "marker-symbol": "cafe"
            }
        });
    })

})
 