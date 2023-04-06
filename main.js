import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import {toLonLat, transform} from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import XYZ from 'ol/source/XYZ';

//## Backend URL
const FLASK_URL = "http://18.134.191.205:5000/sim"
// const FLASK_URL = "http://localhost:5000/sim"

//## HTML elements
const fileInput = document.getElementById('file-input');
const save_button = document.getElementById("save");
const load_button = document.getElementById("load");
const simForm = document.getElementById("simForm");
const sim_btn = document.getElementById("sim-button");
const form = document.getElementById("simForm");
const radio_speed = document.getElementById("radio-speed");
const radio_alt = document.getElementById("radio-alt");
const radio_energy = document.getElementById("radio-energy");
const radio_inundation = document.getElementById("radio-inundation");
const radio_density = document.getElementById("radio-density");
const radio_depth = document.getElementById("radio-depth");
const layers_div = document.getElementById("layers");
const lon_input = document.getElementById("lon-input");
const lat_input = document.getElementById("lat-input");
const nObj_input = document.getElementById("nObj-input");
const pondRadius_input = document.getElementById("pondRadius-input");
const tailingsVolume_input = document.getElementById("tailingsVolume-input");
const tailingsDensity_input = document.getElementById("tailingsDensity-input");
const maxTime_input = document.getElementById("maxTime-input");
const timeStep_input = document.getElementById("timeStep-input");


var minLon = 0;
var maxLon = 0;
var minLat = 0;
var maxLat = 0;

//## Map elements
var map = new Map({
  target: 'map',
  layers: [
    new LayerGroup({
      // A layer must have a title to appear in the layerswitcher
      title: 'Base maps',
      layers: [
        new TileLayer({
          // A layer must have a title to appear in the layerswitcher
          title: 'Terrain',
          // Again set this layer as a base layer
          type: 'base',
          visible: false,
          source: new Stamen({
            layer: 'terrain',
            maxZoom: 19
          })
        }),
        new TileLayer({
          // A layer must have a title to appear in the layerswitcher
          title: 'OSM',
          // Again set this layer as a base layer
          type: 'base',
          visible: true,
          source: new OSM()
        }),
        new TileLayer({
          title: "Satellite",
          type: 'base',
          source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 19
          })
        })
      ]
    }),
  ],
  view: new View({
    center: transform([-44.119589277222296, -20.133112801], 'EPSG:4326', 'EPSG:3857'),
    zoom: 4.5
  })
});

var layerSwitcher = new LayerSwitcher({
  groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
});
map.addControl(layerSwitcher);

map.on('dblclick', function(evt){
  
  var coords = toLonLat(evt.coordinate);
  lat_input.value = coords[1];
  lon_input.value = coords[0];
  // var locTxt = "Latitude: " + lat + " Longitude: " + lon;
  // coords is a div in HTML below the map to display
});

function getExtent(minX, maxX, minY, maxY) {
  const extent = [
    transform([minX, minY], 'EPSG:4326', 'EPSG:3857'),
    transform([maxX, maxY], 'EPSG:4326', 'EPSG:3857')
  ];
  return [extent[0][0], extent[0][1], extent[1][0], extent[1][1]];
}


function setMapViewToCoords(longitude, latitude) {
  const view = map.getView();
  view.setCenter(transform([longitude, latitude], 'EPSG:4326','EPSG:3857'));
}

lon_input.addEventListener("change", event => {
  setMapViewToCoords(lon_input.value, lat_input.value)
})
lat_input.addEventListener("change", event => {
  setMapViewToCoords(lon_input.value, lat_input.value)
})

//## 
function addLayerToMap(minLon, maxLon, minLat, maxLat, mask,layername) {
  const imageUrl = mask;
  const imageExtent = getExtent(minLon, maxLon, minLat, maxLat)
  map.getView().fit(imageExtent, map.getSize());

  const speedLayer = new ImageLayer({
    source: new Static({
      url: imageUrl,
      imageExtent: imageExtent
    }),
    properties: {
      name: layername
    },
    visible: false
  });

  map.addLayer(speedLayer);
  // add image element to display the PNG image
  const img = document.createElement('img');
  img.src = imageUrl;
  document.body.appendChild(img);
};

function highlightClicked(button) {
  // set all to be off
  radio_speed.type = "btn btn-secondary";
  radio_alt.type = "btn btn-secondary";
  radio_energy.type = "btn btn-secondary";
  radio_inundation.type = "btn btn-secondary";
  radio_density.type = "btn btn-secondary";
  radio_depth.type = "btn btn-secondary";

  // set the selected one to on
  button.type = "btn btn-primary";
}


radio_speed.addEventListener("click", event =>{
  selectLayer('speed');
});
radio_alt.addEventListener("click", event =>{
  selectLayer('alt');
});
radio_energy.addEventListener("click", event =>{
  selectLayer('energy');
});
radio_inundation.addEventListener("click", event =>{
  selectLayer('inundation');
});
radio_density.addEventListener("click", event =>{
  selectLayer('density');
});
radio_depth.addEventListener("click", event =>{
  selectLayer('depth');
});


function submitForm() {
  
  sim_btn.innerHTML = '<span class="spinner-grow spinner-grow-sm" id="sim-spin"></span>  Simulating';
  sim_btn.disabled = true;

  const data = {
    latitude: lat_input.value,
    longitude: lon_input.value,
    nObj: nObj_input.value,
    pondRadius: pondRadius_input.value,
    tailingsVolume: tailingsVolume_input.value,
    tailingsDensity: tailingsDensity_input.value,
    maxTime: maxTime_input.value,
    timeStep: timeStep_input.value
  };
  
  fetch(FLASK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    
    if (result.status === 1) {
      alert("Unable to process inputs")
    } else {
      
      var layers = map.getLayers().getArray();
      for (var i = layers.length - 1; i >= 0; --i) {
        if (layers[i] instanceof ImageLayer) {
          console.log(i)
          map.removeLayer(layers[i]);
        }
      }        
      
      minLon = result.minLon;
      maxLon = result.maxLon;
      minLat = result.minLat;
      maxLat = result.maxLat;

      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.speed,"speed");
      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.alt,"alt");
      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.energy,"energy");
      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.inundation,"inundation");
      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.density,"density");
      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.depth,"depth");
      
      layers_div.style.visibility="visible";
      radio_speed.checked = true;
      selectLayer('speed');
      
    }
    sim_btn.innerHTML = 'Simulate'
    sim_btn.disabled = false;
    save_button.disabled = false;
    })
    .catch(error => {
      console.error(error);
      alert("Simulation failed to run")

      sim_btn.innerHTML = 'Simulate'
      sim_btn.disabled = false;
      save_button.disabled = false;
      

    });


}

simForm.addEventListener("submit", event => {
  event.preventDefault();
  submitForm();
});

function selectLayer(id) {
  var layers = map.getLayers().getArray();
  for (var i = layers.length - 1; i >= 0; --i) {
    if (layers[i] instanceof ImageLayer) {
      if (layers[i].getProperties().name === id) {
        layers[i].setVisible(true);
      } else{
        layers[i].setVisible(false);
      }
      // console.log(layers[i].getProperties().name)
    }
  }   
}


save_button.addEventListener("click", event => {
  event.preventDefault();

  const data = {
    latitude: lat_input.value,
    longitude: lon_input.value,
    nObj: nObj_input.value,
    pondRadius: pondRadius_input.value,
    tailingsVolume: tailingsVolume_input.value,
    tailingsDensity: tailingsDensity_input.value,
    maxTime: maxTime_input.value,
    timeStep: timeStep_input.value,
    minLon: minLon,
    maxLon: maxLon,
    minLat: minLat,
    maxLat: maxLat
  };

  var layers = map.getLayers().getArray();
  for (var i = layers.length - 1; i >= 0; --i) {
    if (layers[i] instanceof ImageLayer) {
      var source = layers[i].getSource();
      var ilurl = source.getUrl();
      data[layers[i].getProperties().name] = ilurl;
    }
  } 
  var jsonData = JSON.stringify(data)
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'IMAWARE.save';
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
})

load_button.addEventListener("click", event => {
  event.preventDefault();
  fileInput.click();
})

fileInput.addEventListener('change', function() {
  const file = fileInput.files[0];

  const reader = new FileReader();

  reader.onload = function(event) {
    const json = JSON.parse(event.target.result);

    // Do something with the extracted values
    minLon = json.minLon;
    maxLon = json.maxLon;
    minLat = json.minLat;
    maxLat = json.maxLat;
    lat_input.value = json.latitude;
    lon_input.value = json.longitude;
    nObj_input.value = json.nObj;
    pondRadius_input.value = json.pondRadius;
    tailingsVolume_input.value = json.tailingsVolume;
    tailingsDensity_input.value = json.tailingsDensity;
    maxTime_input.value = json.maxTime;
    timeStep_input.value = json.timeStep;
    console.log(minLon, maxLon, minLat, maxLat)
    addLayerToMap(minLon, maxLon, minLat, maxLat, json.speed,"speed");
    addLayerToMap(minLon, maxLon, minLat, maxLat, json.alt,"alt");
    addLayerToMap(minLon, maxLon, minLat, maxLat, json.energy,"energy");
    addLayerToMap(minLon, maxLon, minLat, maxLat, json.inundation,"inundation");
    addLayerToMap(minLon, maxLon, minLat, maxLat, json.density,"density");
    addLayerToMap(minLon, maxLon, minLat, maxLat, json.depth,"depth");

    layers_div.style.visibility="visible";
    radio_inundation.checked = true;
    selectLayer('inundation');

  };

  reader.readAsText(file);

});