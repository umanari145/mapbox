
$(function(){
    let featureList = null;

    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0c3Vtb3RvLW5vcmlvIiwiYSI6ImNrcXA4M2E4ODBzMHUyd3IxaWJ2bzJ2bXMifQ.xIXNRnsx4lFOTRWYvskLwg';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [140.0205937617735,35.6917560333537], // starting position
        zoom: 16// starting zoom
    });

    const popUp = new mapboxgl.Popup();

    map.on('load', function () {

        $.ajax({
            url:"/get_geojson.php",
            type:"GET"
        }).done((res) => {
            featureList = res;
            renderingMap(res);
        }).fail((XMLHttpRequest, textStatus, errorThrown) =>{
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
            alert("API読み込みに失敗しました。")
        })

        rangeRendering();

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

        map.on('click', 'polygon_sample', (e) => {
            setPopUp(e , 'polygon');
        });

        map.on('click', 'pin_sample', (e) => {
            setPopUp(e, 'pin');
        });

        function setPopUp(e, polyType)
        {
            let coordinates;
            if (polyType === 'pin') {
                coordinates = e.features[0].geometry.coordinates;
            } else if (polyType === 'polygon') {
                let pointArr = e.features[0].geometry.coordinates[0].slice();
                coordinates = pointArr[0];
            }
            let prop = e.features[0].properties;          
            let html =`
                ${prop.store_name}<br>           
                <button id="delete_${prop.id}" class="delete_geo">削除</button>
`            
            popUp.setLngLat(coordinates)
                 .setHTML(html)
                 .addTo(map);
        }      

    });

    function rangeRendering()
    {
        map.addSource("range", {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: null
                }
            }
        });

        map.addLayer({
            "id": "square",
            "type":"fill",
            "source": "range",
            "layout": {},
            "filter": ['==', '$type', 'Polygon'],
            "paint": {
                'fill-color': '#008000',
                'fill-opacity': 0.4,
            }
        });

        map.addLayer({
            "id": "circle",
            "type": "circle",
            "source": "range",
            "layout": {},
            "filter": ['==', '$type', 'Point'],
            "paint": {
                'circle-color': '#008000',
                //zoom=16のときほぼmに相当
                'circle-radius': 300,
                'circle-opacity':0.4
            }
        })

    }

    $("#clear").click(function(){
        $("#input_box").html("")
        
    })

    $(document).on("click", ".delete_geo", function(){
        if (confirm("削除してよいでしょうか?")) {
            let id = $(this).attr("id").split("_")[1];
            deleteGeoJson(id);
        }
    })

    $("#update_polygon").click(function(){
        makeUpdatePolygon();
        map.getSource('plot').setData(featureList);
    })

    $("#persist_polygon").click(function(){
        let geoTemplate = makeUpdatePolygon();
        updateGeoJson(geoTemplate);
    })

    function updateGeoJson(geoTemplate)
    {
        $.ajax({
            url:'/update_geojson.php',
            type:'POST',
            contentType:'application/x-www-form-urlencoded',
            data:geoTemplate,
            dataType: 'json'
        })
        .done((res) => {
            if (res['res'] === true) {
                //更新したのでsetする
                featureList = res['data'];
                map.getSource('plot').setData(featureList);
                alert("更新が成功しました。")
            } else {
                alert("更新に失敗しました。")
            }
        })
        .fail((XMLHttpRequest, textStatus, errorThrown) => {
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
            alert("更新に失敗しました。")
        }).always((res) => {
            console.log("処理終了です。")
        });
    }

    function deleteGeoJson(id)
    {
        $.ajax({
            url:'/delete_geojson.php',
            type:'POST',
            data:{
                'id':id
            },
            contentType:'application/x-www-form-urlencoded',
            dataType: 'json'
        })
        .done((res) => {
            if (res['res'] == true) { 
                alert("削除に成功しました。")
                popUp.remove();
                featureList = res['data'];
                map.getSource('plot').setData(featureList);
            } else {
                alert("削除に失敗しました。");                
            }
        })
        .fail((XMLHttpRequest, textStatus, errorThrown) => {
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
            alert("削除に失敗しました。")
        }).always((res) => {
            alert("処理終了です。")
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
        let addPolygon = makeCordinates('Polygon', polygonRow);
        polygonTemplate["geometry"]["coordinates"].push(addPolygon)
        featureList.features.push(polygonTemplate)
        return polygonTemplate;
    }

    $("#update_pin").click(function(){
        makeUpdatePin();
        map.getSource('plot').setData(featureList);
    })

    $("#persist_pin").click(function(){
        let geoTemplate = makeUpdatePin();
        updateGeoJson(geoTemplate);
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
        let addPin = makeCordinates('Point', pinRow);
        pinTemplate.geometry.coordinates = addPin;
        featureList.features.push(pinTemplate)
        return pinTemplate;
    }

    $("#range_hanei").click(function(){      

        let data = {
            'range_type':'square',
            'lulonlat':convertCoordinates('lulonlat'),
            'rdlonlat':convertCoordinates('rdlonlat'),
        };

        makeRangeGeo();

        $.ajax({
            url:'/get_geojson.php',
            type:'GET',
            data:data,
            contentType:'application/x-www-form-urlencoded',
            dataType: 'json'
        });
    });

    function makeRangeGeo()
    {
        let coordinates = []
        let poly = [];
        let v1 = $('input[name="lulonlat"]').val().replace("[", "").replace("]", "").split(",").filter(function(v){return v !=='';});
        let v2 = $('input[name="rdlonlat"]').val().replace("[", "").replace("]", "").split(",").filter(function(v){return v !=='';});

        let lulalon = [v1[0], v1[1]];
        let ldlalon = [v1[0], v2[1]];
        let rdlalon = [v2[0], v2[1]];
        let rulalon = [v2[0], v1[1]];

        poly.push(lulalon);
        poly.push(ldlalon);
        poly.push(rdlalon);
        poly.push(rulalon);

        coordinates.push(poly);

        let polygonTemplate = {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": coordinates
            }
        }

        map.getSource('range').setData(polygonTemplate);
    }

    function convertCoordinates(inputName)
    {   
        let selector =`input[name="${inputName}"]`
        let v = $(selector).val() || '';
        let v2 = v.replace("[", "").replace("]", "").split(",")
        let lu = {
            'lon':v2[0],
            'lat':v2[1]
        };
        return lu
    }

    function makeCordinates(type, coordinatesRow)
    {

        let addCoordinates = []
        
        switch (type) {
            case 'Polygon':
                coordinatesRow.split(',\n').forEach(v => {
                    let polygonPoint = [];
                    let v2 = v.replace("[", "").replace("]", "").split(",")
                    polygonPoint.push(v2[0]);
                    polygonPoint.push(v2[1]);
                    addCoordinates.push(polygonPoint);         
                });
                break;
            case 'Point':
                coordinatesRow.replace("[", "").replace("]", "").split(',').forEach(v => {
                    if (v !== "" &&  v !== undefined) {
                        addCoordinates.push(v)
                    }
                });
                break;
        }

        return addCoordinates;
    }
})
 