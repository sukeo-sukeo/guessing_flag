
const WORLDMAP = L.map("worldmap").setView([50, 50], 2);
const url = "http://{s}.tile.stamen.com/{variant}/{z}/{x}/{y}.png";

const init = () => {
  L.tileLayer(url, {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
    variant: "toner-lite",
  }).addTo(WORLDMAP);
}

const marker = (latlng, name, link) => {
  let Layer = [];
  const Markers_shape = [];
  const Markers_shape_pos = [];
  const Markers_shape_nam = [];
  const Markers_shape_lnk = [];
  Markers_shape_pos[0] = latlng;
  Markers_shape_nam[0] = name;
  Markers_shape_lnk[0] =
    `<a href=${link} target='_blank'>${name}へのリンク</a>`;
  Markers_shape[0] = L.marker([
    Markers_shape_pos[0][0],
    Markers_shape_pos[0][1],
  ]);
  Markers_shape[0]
    .bindPopup(Markers_shape_nam[0] + "<br>" + Markers_shape_lnk[0])
    .openPopup();
  Layer[0] = Markers_shape[0];
  // Layer[0].addTo(WORLDMAP);
  return Layer[0]
}

const removeMarker = () => {
  console.log(marker);
  WORLDMAP.removeLayer(marker)
}

window.onload = init()
