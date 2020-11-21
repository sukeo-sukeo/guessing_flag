'use strict'

const INITIAL_LATLNG = [35.681, 0];

const WORLDMAP = L.map("worldmap").setView(INITIAL_LATLNG, 2);
const MINIMAP = L.map("minimap", { zoomControl: false }).setView(INITIAL_LATLNG, 0);
const MARKER = document.querySelector('.leaflet-marker-pane')
const popUpDom = document.getElementsByClassName("leaflet-popup-pane");
[...popUpDom].forEach((dom) => {
  dom.style.visibility = "hidden";
});

console.log(MARKER);
const MARKER_URL = 'https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon-2x.png'

const URL = "http://{s}.tile.stamen.com/{variant}/{z}/{x}/{y}.png";

const init = () => {
  return L.tileLayer(URL, {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
    variant: "toner-lite"
  })
}

const makeMarker = (lat_lng, name, link) => {
  const Markers_shape = [];
  const Markers_shape_pos = [];
  const Markers_shape_nam = [];
  const Markers_shape_lnk = [];
  Markers_shape_pos[0] = lat_lng;
  Markers_shape_nam[0] = name;
  Markers_shape_lnk[0] =
    `<a href=${link} target='_blank'>${name}へのリンク</a>`;
  Markers_shape[0] = L.marker([
    Markers_shape_pos[0][0],
    Markers_shape_pos[0][1],
  ]);

  Markers_shape[0]
    .bindTooltip(Markers_shape_nam[0], {
      permanent: true,
      // offset: L.point(40, 0)
    })
    .openTooltip();
  Markers_shape[0]
    .bindPopup(Markers_shape_nam[0])
    .openPopup();
  return Markers_shape[0];
}

const hiddenName = () => {
  if (referMarkers.length === 0) return
  
  const cauntryNames = document.getElementsByClassName('leaflet-tooltip')
  console.log(popUpDom);
  if (nameHidden) {
    [...cauntryNames].forEach((name) => {
      name.style.visibility = "visible";
    });
    [...popUpDom].forEach((dom) => {
      dom.style.visibility = 'hidden'
    });
    nameHidden = false
    return
  }

  if (!nameHidden) {
    [...cauntryNames].forEach(name => {
      name.style.visibility = 'hidden'
    });
    [...popUpDom].forEach((dom) => {
      dom.style.visibility = 'visible'
    });

    nameHidden = true
    return
  }  
}


const removeMarker = (markers) => {
  markers.forEach(marker => {
    WORLDMAP.removeLayer(marker)
  })
}

const removeCircle = (circle) => {
   MINIMAP.removeLayer(circle);
}

const makeCircle = (lat, lng) => {
  if (referCircle) {
    removeCircle(referCircle)
  }
  return L.circle([lat, lng], {
    radius: 2000 * 1000,
    color: 'red',
    fillColor: 'pink',
    fillOpacity: .5
 })
}

const firstLading = () => {
  init().addTo(WORLDMAP)
  init().addTo(MINIMAP)
}

window.onload = firstLading() 
