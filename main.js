// ## Backend URL
const FLASK_URL = "http://18.134.191.205:5000/"
// const FLASK_URL = "http://127.0.0.1:5000/"

import './style.css';
import {Map, Overlay, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import {fromLonLat, toLonLat, transform} from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import XYZ from 'ol/source/XYZ';


//## HTML elements
const simSettingsPanelBtn = document.getElementById('sim-setting-panel-btn');
const simSettingsPanelClose = document.getElementById('sim-settings-panel-close');
const simSettingsPanel = document.getElementById('sim-settings-panel');
const tailingsDensityDiv = document.getElementById('tailingsDensityDiv')
const dampingFactorDiv = document.getElementById('dampingFactorDiv')
const aboutPanelBtn = document.getElementById('about-panel-btn');
const aboutPanelClose = document.getElementById('about-panel-close');
const aboutPanel = document.getElementById('about-panel');
const baseBtn = document.getElementById('base-btn')
const baseSelector = document.getElementById('base-selector')
const resultBtn = document.getElementById('result-btn')
const resultSelector = document.getElementById('result-selector')
const fileInput = document.getElementById('file-input');
const save_button = document.getElementById("save");
const load_button = document.getElementById("load");
const simForm = document.getElementById("simForm");
const sim_btn = document.getElementById("sim-button");
const radio_speed = document.getElementById("radio-speed");
const radio_energy = document.getElementById("radio-energy");
const radio_depth = document.getElementById("radio-depth");
const radio_clear = document.getElementById("radio-clear");

const lon_input = document.getElementById("lon-input");
const lat_input = document.getElementById("lat-input");
const nObj_input = document.getElementById("nObj-input");
const pondRadius_input = document.getElementById("pondRadius-input");
const tailingsVolume_input = document.getElementById("tailingsVolume-input");
const oreType_select = document.getElementById('oreType-select');
const dampingFactor_input = document.getElementById('dampingFactor-input')
const tailingsDensity_input = document.getElementById("tailingsDensity-input");
const maxTime_input = document.getElementById("maxTime-input");
const timeStep_input = document.getElementById("timeStep-input");
const radio_sat = document.getElementById('radio-sat');
const radio_terrain = document.getElementById('radio-terrain');
const radio_OSM = document.getElementById('radio-OSM');
const colorscale = document.getElementById('colorscale')
const colorscale_img = document.getElementById('colorscale-img')
const colorscale_select = document.getElementById('colorscale-select');
const scale_speed_min = document.getElementById('scale-speed-min')
const scale_energy_min = document.getElementById('scale-energy-min')
const scale_depth_min = document.getElementById('scale-depth-min')
const scale_speed_max = document.getElementById('scale-speed-max')
const scale_energy_max = document.getElementById('scale-energy-max')
const scale_depth_max = document.getElementById('scale-depth-max')

//## Display control
simSettingsPanelBtn.addEventListener('click', () => {
  simSettingsPanel.style.top ="75px"
  aboutPanel.style.top = "100%"
});
simSettingsPanelClose.addEventListener('click',() => simSettingsPanel.style.top = "100%")


aboutPanelBtn.addEventListener('click', () => {
  aboutPanel.style.top ="75px"
  simSettingsPanel.style.top = "100%"
});
aboutPanelClose.addEventListener('click',() => aboutPanel.style.top = "100%")

baseBtn.addEventListener('mouseover', () => {baseSelector.style.display = 'block'})
baseBtn.addEventListener('mouseout', () => {baseSelector.style.display = 'none'})

resultBtn.addEventListener('mouseover', () => {resultSelector.style.display = 'block'})
resultBtn.addEventListener('mouseout', () => {resultSelector.style.display = 'none'})

oreType_select.addEventListener("change", () => {

  if (oreType_select.value === 'custom') {
    tailingsDensityDiv.style.visibility = 'visible';
    dampingFactorDiv.style.visibility = 'visible';
  } else if (oreType_select.value === 'default'){
    tailingsDensityDiv.style.visibility = 'hidden';
    dampingFactorDiv.style.visibility = 'hidden';
    tailingsDensityDiv.value = 1594;
    dampingFactorDiv.value = 0.04;
  }
})

//## Map elements
var minLon = 0;
var maxLon = 0;
var minLat = 0;
var maxLat = 0;
var map = new Map({
  target: 'map',
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
    }),
  ],
  view: new View({
    center: transform([lon_input.value,lat_input.value], 'EPSG:4326', 'EPSG:3857'),
    zoom: 11.5
  })
});

var marker = new Overlay({
  position: fromLonLat([lon_input.value,lat_input.value]),
  positioning: 'center-center',
  element: document.getElementById('marker'),
  stopEvent: false
});
map.addOverlay(marker);

map.on('dblclick', function(evt){
  
  var coords = toLonLat(evt.coordinate);
  lat_input.value = coords[1];
  lon_input.value = coords[0];
  marker.setPosition(evt.coordinate);
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

function moveMarker(longitude,latitude) {
  marker.setPosition(transform([longitude, latitude], 'EPSG:4326','EPSG:3857'));
}
function setMapViewToCoords(longitude, latitude) {
  const view = map.getView();
  view.setCenter(transform([longitude, latitude], 'EPSG:4326','EPSG:3857'));
}

lon_input.addEventListener("change", event => {
  setMapViewToCoords(lon_input.value, lat_input.value);
  moveMarker(lon_input.value, lat_input.value)
  
})
lat_input.addEventListener("change", event => {
  setMapViewToCoords(lon_input.value, lat_input.value);
  moveMarker(lon_input.value, lat_input.value)
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

//## Select base layer
function selectBaseLayer(id) {
  var layers = map.getLayers().getArray();
  for (var i = layers.length - 1; i >= 0; --i) {
    if (layers[i] instanceof TileLayer) {
      if (layers[i].getProperties().title === id) {
        layers[i].setVisible(true);
      } else{
        layers[i].setVisible(false);
      }
    }
  }   
}

radio_OSM.addEventListener("click", event =>{
  selectBaseLayer('OSM');
});
radio_terrain.addEventListener("click", event =>{
  selectBaseLayer('Terrain');
});
radio_sat.addEventListener("click", event =>{
  selectBaseLayer('Satellite');
});



//## Select results layer
function selectSimLayer(id) {
  var layers = map.getLayers().getArray();
  for (var i = layers.length - 1; i >= 0; --i) {
    if (layers[i] instanceof ImageLayer) {
      if (layers[i].getProperties().name === id) {
        layers[i].setVisible(true);
      } else{
        layers[i].setVisible(false);
      }
    }
  }
  scale_speed_min.style.display = 'none';
  scale_speed_max.style.display = 'none';
  scale_energy_min.style.display = 'none';
  scale_energy_max.style.display = 'none';
  scale_depth_min.style.display = 'none';
  scale_depth_max.style.display = 'none';

  if (id === 'speed') {
    scale_speed_min.style.display = 'inline';
    scale_speed_max.style.display = 'inline';
  } else if (id === 'energy') {
    scale_energy_min.style.display = 'inline';
    scale_energy_max.style.display = 'inline';
  } else if (id === 'depth') {
    scale_depth_min.style.display = 'inline';
    scale_depth_max.style.display = 'inline';
  }
}

radio_speed.addEventListener("click", event =>{
  selectSimLayer('speed');
});
radio_energy.addEventListener("click", event =>{
  selectSimLayer('energy');
});
radio_depth.addEventListener("click", event =>{
  selectSimLayer('depth');
});
radio_clear.addEventListener("click", event =>{
  selectSimLayer('clear');
});

function runSimulation() {
  
  sim_btn.innerHTML = '<span class="spinner-grow spinner-grow-sm" id="sim-spin"></span>  Simulating';
  sim_btn.disabled = true;

  const data = {
    latitude: lat_input.value,
    longitude: lon_input.value,
    nObj: nObj_input.value,
    pondRadius: pondRadius_input.value,
    tailingsVolume: tailingsVolume_input.value,
    tailingsDensity: tailingsDensity_input.value,
    dampingFactor: dampingFactor_input.value,
    maxTime: maxTime_input.value,
    timeStep: timeStep_input.value,
    cbar: colorscale_select.value
  };
  
  fetch(FLASK_URL + "sim", {
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
          map.removeLayer(layers[i]);
        }
      }        
      minLon = result.minLon;
      maxLon = result.maxLon;
      minLat = result.minLat;
      maxLat = result.maxLat;


      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.speed.img,"speed");
      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.energy.img,"energy");
      addLayerToMap(minLon, maxLon, minLat, maxLat, "data:image/png;base64," + result.depth.img,"depth");
      
      scale_speed_min.textContent = result.speed.mn
      scale_energy_min.textContent = result.energy.mn
      scale_depth_min.textContent = result.depth.mn

      scale_speed_max.textContent = result.speed.mx + " m/s"
      scale_energy_max.textContent = result.energy.mx + " J"
      scale_depth_max.textContent = result.depth.mx + " m"
      // colorscale_img.src = 'colorscales/' + colorscale_select.value + '.png'
      resultBtn.style.visibility="visible";
      radio_speed.checked = true;
      selectSimLayer('speed');
      
    }
    sim_btn.innerHTML = 'Simulate'
    sim_btn.disabled = false;
    save_button.disabled = false;
    })
    .catch(error => {

      alert(error)

      sim_btn.innerHTML = 'Simulate'
      sim_btn.disabled = false;
      save_button.disabled = false;
      

    });


}

simForm.addEventListener("submit", event => {
  event.preventDefault();
  runSimulation();
});

save_button.addEventListener("click", event => {
  event.preventDefault();

  const data = {
    latitude: lat_input.value,
    longitude: lon_input.value,
    nObj: nObj_input.value,
    pondRadius: pondRadius_input.value,
    tailingsVolume: tailingsVolume_input.value,
    tailingsDensity: tailingsDensity_input.value,
    dampingFactor: dampingFactor_input.value,
    maxTime: maxTime_input.value,
    timeStep: timeStep_input.value,
    scale_speed_min: scale_speed_min.textContent,
    scale_energy_min: scale_energy_min.textContent,
    scale_depth_min: scale_depth_min.textContent,
    scale_speed_max: scale_speed_max.textContent,
    scale_energy_max: scale_energy_max.textContent,
    scale_depth_max: scale_depth_max.textContent,
    colorscale: colorscale_select.value,
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
    dampingFactor_input.value = json.dampingFactor_input;
    maxTime_input.value = json.maxTime;
    timeStep_input.value = json.timeStep;

    scale_speed_min.textContent = json.scale_speed_min
    scale_energy_min.textContent = json.scale_energy_min
    scale_depth_min.textContent = json.scale_depth_min
    scale_speed_max.textContent = json.scale_speed_max
    scale_energy_max.textContent = json.scale_energy_max
    scale_depth_max.textContent = json.scale_depth_max
    colorscale_select.value = json.colorscale

    addLayerToMap(minLon, maxLon, minLat, maxLat, json.speed,"speed");
    addLayerToMap(minLon, maxLon, minLat, maxLat, json.energy,"energy");
    addLayerToMap(minLon, maxLon, minLat, maxLat, json.depth,"depth");

    resultBtn.style.visibility="visible";
    radio_inundation.checked = true;
    selectSimLayer('speed');

  };

  reader.readAsText(file);

});


// Function to create the heatmap with the specified colorscale
function make_colorbar(color) {

  fetch(FLASK_URL + "colorbar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({'color':color})
  })
  .then(response => response.json())
  .then(result => {
    colorscale_img.src = "data:image/png;base64," + result.img;
  })

} 
make_colorbar(colorscale_select.value)
colorscale_select.addEventListener("change", () => {
  make_colorbar(colorscale_select.value)
})
