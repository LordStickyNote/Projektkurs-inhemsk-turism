export function renderMap(sections, container) {
    const ownIcon = L.divIcon({
        className: "",
        html: `<svg id="Lager_1" data-name="Lager 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <style>
      .cls-1 {
        fill: #02ad6f;
      }

      .cls-2 {
        opacity: .75;
      }

      .cls-3 {
        opacity: .85;
      }

      .cls-4 {
        fill: #122e2e;
      }
    </style>
  </defs>
  <g class="cls-2">
    <path class="cls-1" d="M50,99.5C22.71,99.5.5,77.29.5,50S22.71.5,50,.5s49.5,22.21,49.5,49.5-22.21,49.5-49.5,49.5Z"/>
    <path d="M50,1c27.02,0,49,21.98,49,49s-21.98,49-49,49S1,77.02,1,50,22.98,1,50,1M50,0C22.39,0,0,22.39,0,50s22.39,50,50,50,50-22.39,50-50S77.61,0,50,0h0Z"/>
  </g>
  <g class="cls-3">
    <ellipse class="cls-4" cx="50" cy="50" rx="37.36" ry="35.71"/>`,
        iconSize: [28, 32],
        iconAnchor: [14, 12]
    })

  container.innerHTML = `<div id="map"></div>`;

  const map = L.map("map").setView([56.879, 14.805], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  for (const section of sections) {
    for (const item of section.items) {

        L.marker([Number(item.lat), Number(item.lng)], { icon: ownIcon })
        .addTo(map)
        .bindPopup(`<strong>${item.name}</strong>`)
    }
  }
}