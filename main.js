





// Declare variables

const input = document.getElementById("search-bar");
var map = L.map('map').setView([50.829935, 10.337573], 11);
var info = document.getElementById("info");

var radius = 10;

var markers = [];

// Create map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);






/*
var marker = L.marker([51.5, -0.09]).addTo(map);






var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047],
    [51.52, -0.04]
]).addTo(map);

marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);




var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);  



*/


function rangeKmSlider(){
    const value = document.querySelector("#range-output");
    const input = document.querySelector("#range-input");

    value.textContent = input.value;
    input.addEventListener("input", (event) => {
        radius = parseInt(event.target.value);
        value.textContent = radius;
        
    });
}



input.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') {
        newLocation(e.target.value);
    }
})

function searchPos(){

    map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polygon) {
            map.removeLayer(layer);
        }
    });
    var lng = parseFloat(document.getElementById("lng").value);
    var lat = parseFloat(document.getElementById("lat").value);
    map.setView([lat, lng], 13-(radius*0.35));

    var {latMin, lngMin, latMax, lngMax} = calcRadius(lat, lng, radius);

    var polygon1 = L.polygon([
        [latMin, lngMin],
        [latMax, lngMin],
        [latMax, lngMax],
        [latMin, lngMax]], {
            color: 'green'
        }
     ).addTo(map);

     requestGeoData(lat, lng, radius);

}


function newLocation(position) {
    
}

function calcRadius(latDeg, lngDeg, radius) {
    const earth_radius = 6371;

    const lat = latDeg * Math.PI / 180;
    const lng = lngDeg * Math.PI / 180;

    const angular_distance = (radius / earth_radius);

    const latMin = lat - angular_distance;
    const latMax = lat + angular_distance;

    const deltaLng = Math.asin((Math.sin(angular_distance) / Math.cos(lat)));

    const lngMin = lng - deltaLng;
    const lngMax = lng + deltaLng;

    return {
        latMin: latMin * 180 / Math.PI,
        lngMin: lngMin * 180 / Math.PI,
        latMax: latMax * 180 / Math.PI,
        lngMax: lngMax * 180 / Math.PI,
    }
}




function requestGeoData(latDeg, lngDeg, radius) {

    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    const baseUrl = 'https://paleobiodb.org/data1.2/occs/list.json';

    var {latMin, lngMin, latMax, lngMax} = calcRadius(latDeg, lngDeg, radius);

    const apiUrl = `${baseUrl}?show=coords&lngmin=${lngMin}&lngmax=${lngMax}&latmin=${latMin}&latmax=${latMax}`;

    fetch(apiUrl)
        .then(response => {
            if(!response.ok){
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const occurrences = data.records;
            occurrences.forEach(fossil => {
                console.log(`Species: ${fossil.tna}`);
                console.log(`Age range: ${fossil.lag} - ${fossil.eag} Ma`);
                console.log(`Location: Lat: ${fossil.lat}, Lng: ${fossil.lng}`);
                console.log(`---`);

                let marker = L.marker([parseFloat(fossil.lat), parseFloat(fossil.lng)])
                .addTo(map)
                .bindPopup(`<b>This is a ${fossil.tna}</b><br>Age range: ${fossil.lag} - ${fossil.eag} Ma <br> Location: Lat: ${fossil.lat}, Lng: ${fossil.lng}`);

                markers.push(marker);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });

}



rangeKmSlider();