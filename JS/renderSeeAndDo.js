import { API_KEY } from "./config.js";

export function renderSeeAndDo(sections, container) {
  container.innerHTML = "";

  for (const section of sections) {
    const sectionElement = document.createElement("section");

    sectionElement.classList.add("grid", "width-full", "gap-6");

    for (const item of section.items) {
      const article = document.createElement("article");

      article.innerHTML = `
        <div class="card card-listing">
          <img src="/img/High_Chaparral_Theme_Park.jpg" alt="" />

          <span class="card-listing-content width-full">
            <h3>${item.name}</h3>
            <h4 class="text-faded">${item.city}</h4>

            <span class="row row-between">
              <span class="gap-2">
                <span class="badge badge-red">${item.description}</span>
              </span>

              <span class="row">
                <h4>${Math.trunc(item.rating)}</h4>
                <svg class="star" viewBox="0 0 16 16">
                  <path
                    d="M7.71954 0.445459C7.86922 -0.0151958 8.52092 -0.0151964 8.6706 0.445459L9.76667 3.81881C9.8336 4.02483 10.0256 4.16431 10.2422 4.16431H13.7892C14.2735 4.16431 14.4749 4.78411 14.083 5.06881L11.2135 7.15366C11.0383 7.28098 10.9649 7.50667 11.0319 7.71268L12.1279 11.086C12.2776 11.5467 11.7504 11.9298 11.3585 11.6451L8.48896 9.5602C8.31372 9.43288 8.07642 9.43288 7.90118 9.5602L5.03163 11.6451C4.63977 11.9298 4.11253 11.5467 4.26221 11.086L5.35828 7.71268C5.42521 7.50667 5.35188 7.28098 5.17664 7.15366L2.30709 5.06881C1.91524 4.78411 2.11662 4.16431 2.60099 4.16431H6.14794C6.36455 4.16431 6.55653 4.02483 6.62347 3.81881L7.71954 0.445459Z"
                  ></path>
                </svg>
              </span>
            </span>
          </span>
        </div>
      `;

      article.addEventListener("click", () => {
        openPlaceModal(item);
      });

      sectionElement.append(article);
    }

    container.append(sectionElement);
  }
}

async function openPlaceModal(item) {
  const modal = document.querySelector("#placeModal");

  document.querySelector("#modalName").textContent = item.name || "Namn saknas";

  document.querySelector("#modalCity").textContent =
    item.city || item.municipality || "Ort saknas";

  document.querySelector("#modalDescription").textContent =
    item.text || item.abstract || item.description || "Beskrivning saknas.";

  document.querySelector("#modalPrice").textContent =
    item.price_range || "Pris saknas";

  document.querySelector("#modalRating").textContent = item.rating
    ? Number(item.rating).toFixed(1)
    : "Betyg saknas";

  document.querySelector("#modalPhone").textContent =
    item.phone_number || "Telefon saknas";

  const website = document.querySelector("#modalWebsite");

  if (item.website) {
    website.href = item.website;
    website.textContent = item.website;
  } else {
    website.removeAttribute("href");
    website.textContent = "Webbplats saknas";
  }

  modal.classList.remove("modal-overlay-hidden");
  modal.classList.add("modal-overlay-visible");

  await renderNearbyPlacesInModal(item);
}

async function renderNearbyPlacesInModal(item) {
  const nearbyContainer = document.querySelector("#modalNearbyPlaces");

  nearbyContainer.innerHTML = "<p class='text-faded'>Laddar platser...</p>";

  if (!item.lat || !item.lng) {
    nearbyContainer.innerHTML =
      "<p class='text-faded'>Inga närliggande platser hittades.</p>";
    return;
  }

  const url =
    "https://smapi.lnu.se/api/?debug=true" +
    `&api_key=${API_KEY}` +
    "&controller=activity" +
    "&method=getfromlatlng" +
    `&lat=${item.lat}` +
    `&lng=${item.lng}` +
    "&radius=15";

  const response = await fetch(url);
  const data = await response.json();

  const nearbyPlaces = (data.payload || [])
    .filter((place) => place.id !== item.id)
    .slice(0, 4);

  if (nearbyPlaces.length === 0) {
    nearbyContainer.innerHTML =
      "<p class='text-faded'>Inga närliggande platser hittades.</p>";
    return;
  }

  nearbyContainer.innerHTML = "";

  for (const place of nearbyPlaces) {
    const card = document.createElement("div");

    card.classList.add("card", "modal-nearby-card");

    card.innerHTML = `
      <h3>${place.name || "Namn saknas"}</h3>
      <p class="text-faded">${place.description || "Beskrivning saknas"}</p>
    `;

    nearbyContainer.append(card);
  }
}

function closePlaceModal() {
  const modal = document.querySelector("#placeModal");

  modal.classList.remove("modal-overlay-visible");
  modal.classList.add("modal-overlay-hidden");
}

document
  .querySelector("#closeModal")
  .addEventListener("click", closePlaceModal);

document.querySelector("#placeModal").addEventListener("click", (event) => {
  if (event.target.id === "placeModal") {
    closePlaceModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePlaceModal();
  }
});
