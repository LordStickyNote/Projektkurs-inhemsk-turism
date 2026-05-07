export function renderMap(sections, container) {
  container.innerHTML = `<div id="map"></div>`;

  const map = L.map("map").setView([56.879, 14.805], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  for (const section of sections) {
    for (const item of section.items) {

        L.marker([Number(item.lat), Number(item.lng)])
        .addTo(map)
        .bindPopup(`<strong>${item.name}</strong>`)
    }
  }
}