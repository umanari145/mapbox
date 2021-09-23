
import axios from "axios";
import $ from "jquery";

export default class main{

    constructor(map, popUp, mu) {
        this.map = map;
        this.featureList = null;
        this.loadMapBox();
        this.mu = mu;
        this.popUp = popUp;

        //読み込み時に発動する処理
        $("#clear").click(() => {
            $("#input_box").html("")
        });

        $("#clear").click(() => {
            $("#input_box").html("")
        });

        $(document).on("click", ".delete_geo", (event) => {
            if (confirm("削除してよいでしょうか?")) {
                let id = $(event.currentTarget).attr("id").split("_")[1];
                this.deleteGeoJson(id);
            }
        })
    
        this.updateGeometry();

    }

    loadMapBox() {
        this.map.on('load', () => {
            axios.get('/get_geojson.php')
                 .then((res) => {
                    this.featureList = res.data
                    this.renderingMap(res.data);
                 }).catch((error) => {
                    console.log(error);
                    alert("API読み込みに失敗しました。")        
                 })
        });
    }

    renderingMap(data) {
        // ポリゴン設定
        this.map.addSource('plot', {
            type: 'geojson',
            data: data
        });

        // スタイル設定
        this.map.addLayer({
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
        
        this.map.addLayer({
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

        this.map.on('click', (e) => {
            const lat = e.lngLat.lat;
            const lng = e.lngLat.lng;
            var latlon = "[" + lng + "," + lat + "]," + "<br>"
            $("#input_box").append(latlon);
        });

        this.map.on('click', 'polygon_sample', (e) => {
            this.setPopUp(e , 'polygon');
        });

        this.map.on('click', 'pin_sample', (e) => {
            this.setPopUp(e, 'pin');
        });
    }

    setPopUp(e, polyType){
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
        this.popUp.setLngLat(coordinates)
             .setHTML(html)
             .addTo(this.map);
    }

    updateGeometry() {

        $("#update_polygon").click(() => {
            let polygonTemplate = this.mu.makeUpdatePolygon();
            this.featureList.features.push(polygonTemplate)
            this.map.getSource('plot').setData(this.featureList);
        })
    
        $("#persist_polygon").click(() => {
            let geoTemplate = this.mu.makeUpdatePolygon();           
            axios.post('/update_geojson.php', geoTemplate)
                .then((data) => {
                    if (data['data']['res'] === true) {
                        //更新したのでsetする
                        this.featureList = data['data']['data'];
                        this.map.getSource('plot').setData(this.featureList);
                        alert("更新が成功しました。")
                    } else {
                        alert("更新に失敗しました。")
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert("更新に失敗しました。");
                })
                .finally(()=> {
                    console.log("処理終了です。");
                });
        });

        $("#update_pin").click(function(){
            let pinTemplate = this.mu.makeUpdatePin();
            this.featureList.features.push(pinTemplate)
            map.getSource('plot').setData(featureList);
        })
    
        $("#persist_pin").click(function(){
            let geoTemplate = this.mu.makeUpdatePin();
            axios.post('/update_geojson.php', geoTemplate)
                .then((data) => {
                    if (data['res'] === true) {
                        //更新したのでsetする
                        this.featureList = data['data'];
                        this.map.getSource('plot').setData(this.featureList);
                        alert("更新が成功しました。");
                    } else {
                        alert("更新に失敗しました。");
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert("更新に失敗しました。");
                })
                .finally(() => {
                    alert("処理終了です。");
                });
        });
    }

    deleteGeoJson(id) {
        axios.post('/delete_geojson.php', {
            'id':id
        })
        .then((res) => {
            if (res['data']['res'] == true) {
                alert("削除に成功しました。")
                this.popUp.remove();
                this.featureList = res['data']['data'];
                this.map.getSource('plot').setData(this.featureList);
            } else {
                alert("削除に失敗しました。");
            }
        })
        .catch((err) => {
            alert("削除に失敗しました。")
        })
        .finally(() => {
            alert("処理終了です。");
        });
    }

    rangeRendering(){
        this.map.addSource("range", {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: null
                }
            }
        });

        this.map.addLayer({
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

        this.map.addLayer({
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




}