
$(function(){
    let featureList = null;

    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0c3Vtb3RvLW5vcmlvIiwiYSI6ImNrcXA4M2E4ODBzMHUyd3IxaWJ2bzJ2bXMifQ.xIXNRnsx4lFOTRWYvskLwg';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [140.0205937617735,35.6917560333537], // starting position
        zoom: 16 // starting zoom
    });

    const popUp = new mapboxgl.Popup();

    map.on('load', function () {


        $.ajax({
            url:"/api.php",
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
        let addPin = [];
        pinRow.replace("[", "").replace("]", "").split(',').forEach(v => {
            if (v !== "" &&  v !== undefined) {
                addPin.push(v)
            }
        });
        pinTemplate.geometry.coordinates = addPin;
        featureList.features.push(pinTemplate)
        return pinTemplate;
    }
})
 