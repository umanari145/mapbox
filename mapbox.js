
$(function(){
    let featureList = null;

    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0c3Vtb3RvLW5vcmlvIiwiYSI6ImNrcXA4M2E4ODBzMHUyd3IxaWJ2bzJ2bXMifQ.xIXNRnsx4lFOTRWYvskLwg';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [140.0205937617735,35.6917560333537], // starting position
        zoom: 16 // starting zoom
    });

    map.on('load', function () {

        $.ajax({
            url:"/api.php",
            type:"GET"
        }).done(function(res){
            featureList = JSON.parse(res);
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


    $("#update_polygon").click(function(){
        makeUpdatePolygon();
        map.getSource('plot').setData(featureList);
    })

    $("#persist_polygon").click(function(){
        makeUpdatePolygon();
        updateGeoJson();
    })

    function updateGeoJson()
    {
        $.ajax({
            url:'/update_geojson.php',
            type:'POST',
            data:JSON.stringify({
                'featureList':featureList
            }),
            contentType: 'application/json',
        })
        .done((res) => {
            alert("無事に更新しました。")
        })
        .fail((res) => {
            alert("処理に失敗しました。")
        }).always((res) => {
            map.getSource('plot').setData(featureList);
            console.log("処理終了です。")
        });
    }

    function makeUpdatePolygon()
    {
        let polygonTemplate = {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [
              ]
            }
        }

        let polygonRow = $("#polygon_txt").val() || '';

        let addPolygon = []
        polygonRow.split(',\n').forEach(v => {
            let polygonPoint = [];
            let v2 = v.replace("[", "").replace("]", "").split(",")
            polygonPoint.push(v2[0]);
            polygonPoint.push(v2[1]);
            addPolygon.push(polygonPoint)            
        });

        polygonTemplate["geometry"]["coordinates"].push(addPolygon)
        featureList.features.push(polygonTemplate)       
    }

    $("#update_pin").click(function(){
        makeUpdatePin();
        map.getSource('plot').setData(featureList);
    })

    $("#persist_pin").click(function(){
        makeUpdatePin();
        updateGeoJson();
    })

    function makeUpdatePin()
    {
        let pinTemplate = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": null
            }
        }

        let pinRow = $("#pin_txt").val() || '';
        let addPin = [];
        pinRow.replace("[", "").replace("]", "").split(',').forEach(v => {
            if (v !== "" &&  v !== undefined) {
                addPin.push(v)
            }
        });
        pinTemplate.geometry.coordinates = addPin;
        featureList.features.push(pinTemplate)
    }
})
 