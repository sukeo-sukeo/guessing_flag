
const WORLDMAP = L.map("worldmap").setView([36, 138], 2);
const URL = "http://{s}.tile.stamen.com/{variant}/{z}/{x}/{y}.png";

const init = () => {
  L.tileLayer(URL, {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
    variant: "toner-lite",
  }).addTo(WORLDMAP);
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
    .bindTooltip(Markers_shape_nam[0], { permanent: true })
    .openTooltip();
  // Markers_shape[0]
  //   .bindPopup(console.log(Markers_shape[0]))
  //   .openPopup()

  return Markers_shape[0];
}

const removeMarker = (markers) => {
  console.log(markers);
  markers.forEach(marker => {
    WORLDMAP.removeLayer(marker)
  })
}

window.onload = init()
