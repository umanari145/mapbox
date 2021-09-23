
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

    makeRangeGeo() {
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
        poly.push(lulalon);

        coordinates.push(poly);

        let polygonTemplate = {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": coordinates
            }
        }
        return polygonTemplate;
    }

}