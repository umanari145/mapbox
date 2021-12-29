
import $ from 'jquery'

export default class mapboxUtil{

    constructor() {

    }

    makeUpdatePolygon() {

        let polygonTemplate = {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [
              ]
            }
        }

        let polygonRow = $("#polygon_txt").val() || '';
        let addPolygon = this.makeCordinates('Polygon', polygonRow);
        polygonTemplate["geometry"]["coordinates"].push(addPolygon)
        return polygonTemplate;
    }

    makeUpdatePin()
    {
        let pinTemplate = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": null
            }
        }

        let pinRow = $("#pin_txt").val() || '';
        let addPin = this.makeCordinates('Point', pinRow);
        pinTemplate.geometry.coordinates = addPin;
        return pinTemplate;
    }

    makeCordinates(type, coordinatesRow)
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

    convertCoordinates(inputName) {   
        let selector =`input[name="${inputName}"]`
        let v = $(selector).val() || '';
        let v2 = v.replace("[", "").replace("]", "").split(",")
        let lu = {
            'lon':v2[0],
            'lat':v2[1]
        };
        return lu
    }

    makeRangeGeo(rangeType) {

        let coordinates = [];
        let geoType;
        let geoTemplate = null;
        switch (rangeType) {
            case "1":
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
                poly.push(lulalon);
                coordinates.push(poly);
                geoType = "Polygon";

                geoTemplate = {
                    "type": "Feature",
                    "geometry": {
                      "type": geoType,
                      "coordinates": coordinates
                    }
                };

                break;

            case "2":
                //今はまだ効かない
                let circleDistance = $('input[name="distance"]').val();
                let c1 = $('input[name="center"]').val().replace("[", "").replace("]", "").split(",").filter(function(v){return v !=='';});
                coordinates = [
                    c1[0],c1[1]
                ];
                geoType = "Point";

                geoTemplate = {
                    "type": "Feature",
                    "geometry": {
                      "type": geoType,
                      "coordinates": coordinates
                    },
                    "properties": {
                        "radius": circleDistance
                    }
                };
                break;
        }


        return geoTemplate;
    }

    dispSQL() {
        let type = null;
        let extent = null;
        let center = null;
        if ($("#range_1").prop('checked')) {
            type = '1';
            let lulonlat = this.convertCoordinates('lulonlat');
            let rdlonlat = this.convertCoordinates('rdlonlat');

            extent = {
                'lat1':lulonlat["lat"],
                'lon1':lulonlat["lon"],
                'lat2':rdlonlat["lat"],
                'lon2':rdlonlat["lon"]
            };

            this.makeGeometory(type, extent, center)

        } else if ($("#range_2").prop('checked')) {
            type = '2';
            let centerlonlat = this.convertCoordinates('center');
            let hankei = $('input[name="distance"]').val() || '';

            center = {
                'lat':centerlonlat["lat"],
                'lon':centerlonlat["lon"],
                'hankei': hankei
            };

            this.makeGeometory(type, extent, center)
        }
    }



    makeGeometory(type, extent, center) {
        let where = "";
        switch (type) {
            case '1'://extent
                let lu = `${extent.lon1} ${extent.lat1}`;
                let ld = `${extent.lon1} ${extent.lat2}`;
                let ru = `${extent.lon2} ${extent.lat1}`;
                let rd = `${extent.lon2} ${extent.lat2}`;
                // makevalidがないと動かない環境あり
                where = `geometry::STGeomFromText('POLYGON((${lu}, ${ld}, ${rd}, ${ru}, ${lu}))', 0).STIntersects(geometry::STGeomFromText(store_position.MakeValid().STAsText(), 0)) = 1`;
                break;

            case '2'://center
                let point =`${center.lon} ${center.lat}`;
                where = `geography::STGeomFromText('POINT(${point})', 4326).STDistance(geography::STGeomFromText(store_position.MakeValid().STAsText(), 4326)) < ${center.hankei}`
                break;
        }

        $('#sql_disp').html(where);
    }

}