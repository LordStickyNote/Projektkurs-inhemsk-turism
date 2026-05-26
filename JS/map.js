import { renderDetailModal } from "./renderDetailModal.js";

const ownIcon = L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g opacity=".75">
    <path fill="#02ad6f" d="M50,99.5C22.71,99.5.5,77.29.5,50S22.71.5,50,.5s49.5,22.21,49.5,49.5-22.21,49.5-49.5,49.5Z"/>
    <path d="M50,1c27.02,0,49,21.98,49,49s-21.98,49-49,49S1,77.02,1,50,22.98,1,50,1M50,0C22.39,0,0,22.39,0,50s22.39,50,50,50,50-22.39,50-50S77.61,0,50,0h0Z"/>
  </g>
  <g opacity=".85">
    <ellipse fill="#122e2e" cx="50" cy="50" rx="37.36" ry="35.71"/>
  </g>
</svg>`,
    iconSize: [26, 32],
    iconAnchor: [14, 12]
})

export function renderMap(sections, container) {

  container.innerHTML = `<div id="map"></div>`;

  const map = L.map("map").setView([56.879, 14.805], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  for (const section of sections) {
    for (const item of section.items) {

        const marker = L.marker([Number(item.lat), Number(item.lng)], { icon: ownIcon });

        marker.addTo(map)
        .bindPopup(`
            <div class="card card-map popup-card">
        <span class="card-popup-content width-full">
          <h2>${item.name}</h2>
          <p class="text-faded">${item.city}</p>
          <span class="row row-between">
              <span class="gap-2">
                <span class="badge badge-red">${item.description}</span>
              </span>
              <span class="row">
              <p>${Math.trunc(item.rating)}</p><svg class="star" viewBox="0 0 16 16">
              <path
                d="M7.71954 0.445459C7.86922 -0.0151958 8.52092 -0.0151964 8.6706 0.445459L9.76667 3.81881C9.8336 4.02483 10.0256 4.16431 10.2422 4.16431H13.7892C14.2735 4.16431 14.4749 4.78411 14.083 5.06881L11.2135 7.15366C11.0383 7.28098 10.9649 7.50667 11.0319 7.71268L12.1279 11.086C12.2776 11.5467 11.7504 11.9298 11.3585 11.6451L8.48896 9.5602C8.31372 9.43288 8.07642 9.43288 7.90118 9.5602L5.03163 11.6451C4.63977 11.9298 4.11253 11.5467 4.26221 11.086L5.35828 7.71268C5.42521 7.50667 5.35188 7.28098 5.17664 7.15366L2.30709 5.06881C1.91524 4.78411 2.11662 4.16431 2.60099 4.16431H6.14794C6.36455 4.16431 6.55653 4.02483 6.62347 3.81881L7.71954 0.445459Z"
              ></path></svg
            >
              </span>
          </span>
        </span>
      </div>`);

      marker.on("popupopen", () => {
        const popupElement = marker.getPopup().getElement();

        popupElement.style.cursor = "pointer";

        popupElement.addEventListener("click", () => {
          renderDetailModal(item);
        })
      })
    }
  }
}

export function renderDetailMap(lat, lng) {

  const detailMap = L.map("detailMap").setView([Number(lat), Number(lng)], 14);

  L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        "&copy; OpenStreetMap contributors",
    }
  ).addTo(detailMap);

  L.marker([Number(lat), Number(lng)], { icon: ownIcon }).addTo(detailMap);
}
