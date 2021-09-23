import mapboxgl from "mapbox-gl";
import main from "./main."; 
import mapboxUtil from "./mapboxUtil";

mapboxgl.accessToken = 'pk.eyJ1IjoibWF0c3Vtb3RvLW5vcmlvIiwiYSI6ImNrcXA4M2E4ODBzMHUyd3IxaWJ2bzJ2bXMifQ.xIXNRnsx4lFOTRWYvskLwg';
const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [140.0205937617735,35.6917560333537], // starting position
    zoom: 16// starting zoom
});
const mu = new mapboxUtil();
const popUp = new mapboxgl.Popup();
const mapboxMain = new main(map, popUp, mu);
