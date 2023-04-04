import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import {transform} from 'ol/proj'


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

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    projection: 'EPSG:3857',
    center: transform([-44.119589277222296, -20.133112801], 'EPSG:4326','EPSG:3857'),
    zoom: 10
  })
});

function getExtent(minX, maxX, minY, maxY) {
  const extent = [
    transform([minX, minY], 'EPSG:4326', 'EPSG:3857'),
    transform([maxX, maxY], 'EPSG:4326', 'EPSG:3857')
  ];
  return [extent[0][0], extent[0][1], extent[1][0], extent[1][1]];
}


function setMapViewToCoords(latitude, longitude) {
  const view = map.getView();
  view.setCenter(transform([longitude, latitude], 'EPSG:4326','EPSG:3857'));
}

function addLayerToMap(minLon, maxLon, minLat, maxLat, mask,layername) {
  const imageUrl = "data:image/png;base64," + mask;
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


  const formData = new FormData(form);
  const data = {
    nObj: formData.get("nObj"),
    pondRadius: formData.get("pondRadius"),
    tailingsVolume: formData.get("tailingsVolume"),
    tailingsDensity: formData.get("tailingsDensity"),
    maxTime: formData.get("maxTime"),
    timeStep: formData.get("timeStep")
  };
  
  const layers_div = document.getElementById("layers");
  
  fetch("http://localhost:5000/sim", {
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
      
      addLayerToMap(result.minLon, result.maxLon, result.minLat, result.maxLat, result.speed,"speed");
      addLayerToMap(result.minLon, result.maxLon, result.minLat, result.maxLat, result.alt,"alt");
      addLayerToMap(result.minLon, result.maxLon, result.minLat, result.maxLat, result.energy,"energy");
      addLayerToMap(result.minLon, result.maxLon, result.minLat, result.maxLat, result.inundation,"inundation");
      addLayerToMap(result.minLon, result.maxLon, result.minLat, result.maxLat, result.density,"density");
      addLayerToMap(result.minLon, result.maxLon, result.minLat, result.maxLat, result.depth,"depth");
      
      layers_div.style.visibility="visible";
      radio_inundation.checked = true;
      selectLayer('inundation');
      
    }
    sim_btn.innerHTML = 'Simulate'
    sim_btn.disabled = false;
    save_button.disabled = false;
    })
    .catch(error => {
      console.error(error);
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

  const formData = new FormData(form);

  const data = {
    nObj: formData.get("nObj"),
    pondRadius: formData.get("pondRadius"),
    tailingsVolume: formData.get("tailingsVolume"),
    tailingsDensity: formData.get("tailingsDensity"),
    maxTime: formData.get("maxTime"),
    timeStep: formData.get("timeStep")
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
})