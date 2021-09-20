
import axios from "axios";
import $ from "jquery";
import mapboxUtil from "./mapboxUtil";

const mu = new mapboxUtil();

export default class main{

    constructor(map) {
        this.map = map;
        this.featureList = null;
        this.loadMapBox();

        //読み込み時に発動する処理
        $("#clear").click(() => {
            $("#input_box").html("")
        });
    }

    loadMapBox() {
        alert("本日は晴天なり")
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
            setPopUp(e , 'polygon');
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
        popUp.setLngLat(coordinates)
             .setHTML(html)
             .addTo(this.map);
    }

    updateGeometry() {

        $("#update_polygon").click(() => {
            makeUpdatePolygon();
            map.getSource('plot').setData(featureList);
        })
    
        $("#persist_polygon").click(() => {
            let geoTemplate = makeUpdatePolygon();
            updateGeoJson(geoTemplate);
        })
    }


}