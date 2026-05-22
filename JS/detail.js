const detailName = document.querySelector("#detail-name");
const infoSection = detailName.closest(".gap-2.stack");
const backButton = document.createElement("a");
const backIcon = document.createElement("img");

backButton.href = "index.html";
backButton.classList.add("back-button", "icon-only");
backButton.setAttribute("aria-label", "Tillbaka");

backIcon.src = "img/tillbakaKnapp.svg";
backIcon.alt = "";
backIcon.classList.add("back-icon");

backButton.appendChild(backIcon);
infoSection.before(backButton);

function yesOrNo(value) {
  if (value === "y") {
    return "Ja";
  }

  return "Nej";
}

async function getNearbyPlacesFromApi(place) {
  const radius = 15;

  if (!place.lat || !place.lng) {
    return [];
  }

  const nearbyApi =
    "https://smapi.lnu.se/api/?debug=true" +
    "&api_key=" +
    API_KEY +
    "&controller=activity" +
    "&method=getfromlatlng" +
    "&lat=" +
    place.lat +
    "&lng=" +
    place.lng +
    "&radius=" +
    radius;

  const response = await fetch(nearbyApi);
  const data = await response.json();

  return data.payload || [];
}

function renderNearbyPlaces(places, currentPlace) {
  const results = document.querySelector("#results");

  results.innerHTML = "";

  const filteredPlaces = places
    .filter((place) => place.id !== currentPlace.id)
    .slice(0, 4);

  if (filteredPlaces.length === 0) {
    const message = document.createElement("p");
    message.classList.add("text-faded");
    message.textContent = "Inga närliggande platser hittades.";

    results.appendChild(message);
    return;
  }

  filteredPlaces.forEach((place) => {
    const card = document.createElement("a");
    card.href = "detail.html?id=" + place.id;
    card.classList.add("card", "stack", "gap-2");

    const title = document.createElement("h3");
    title.textContent = place.name;

    const description = document.createElement("p");
    description.classList.add("text-faded");
    description.textContent = place.description || "Beskrivning saknas";

    const distance = document.createElement("p");
    distance.classList.add("text-faded");

    if (place.distance_in_km) {
      distance.textContent =
        Number(place.distance_in_km).toFixed(1) + " km bort";
    } else {
      distance.textContent = "Avstånd saknas";
    }

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(distance);

    results.appendChild(card);
  });
}

async function loadDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "2";

  const response = await fetch(API);
  const data = await response.json();

  const place = data.payload.find((item) => item.id === id);

  if (!place) {
    detailName.textContent = "Platsen hittades inte";
    return;
  }

  console.log(place);

  detailName.textContent = place.name;

  document.querySelector("#detail-location-type").textContent =
    `${place.city} | ${place.description}`;

  document.querySelector("#detail-price").textContent =
    `${place.price_range} Kr`;

  document.querySelector("#detail-description").textContent =
    place.text || place.abstract || place.description || "Beskrivning saknas.";

  document.querySelector("#detail-phone").textContent =
    place.phone_number || "Telefon saknas";

  document.querySelector("#detail-info-price").textContent =
    `${place.price_range} Kr`;

  document.querySelector("#detail-outdoors").textContent = yesOrNo(
    place.outdoors,
  );

  document.querySelector("#detail-child-discount").textContent = yesOrNo(
    place.child_discount,
  );

  document.querySelector("#detail-student-discount").textContent = yesOrNo(
    place.student_discount,
  );

  document.querySelector("#detail-senior-discount").textContent = yesOrNo(
    place.senior_discount,
  );

  document.querySelector("#detail-review-count").textContent =
    `${place.num_reviews}st`;

  document.querySelector("#detail-rating").textContent = Number(
    place.rating,
  ).toFixed(1);

  const websiteLink = document.querySelector("#detail-website");

  if (place.website) {
    websiteLink.href = place.website;
    websiteLink.textContent = place.website;
  } else {
    websiteLink.textContent = "Webbplats saknas";
    websiteLink.removeAttribute("href");
  }

  const nearbyPlaces = await getNearbyPlacesFromApi(place);

  renderNearbyPlaces(nearbyPlaces, place);
}

loadDetailPage();