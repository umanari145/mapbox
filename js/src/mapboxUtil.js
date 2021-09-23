
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
        let addPin = makeCordinates('Point', pinRow);
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
}