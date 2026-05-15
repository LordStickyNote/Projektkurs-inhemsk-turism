const API =
  "https://smapi.lnu.se/api/?debug=true&api_key=v2c0MPUr&controller=establishment&method=getall";

function yesOrNo(value) {
  if (value === "y") {
    return "Ja";
  }
  return "Nej";
}

async function loadDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "2";
  const response = await fetch(API);
  const data = await response.json();
  const place = data.payload.find((item) => item.id === id);

  if (!place) {
    document.querySelector("#detail-name").textContent =
      "Platsen hittades inte";
    return;
  }

  document.querySelector("#detail-name").textContent = place.name;
  document.querySelector("#detail-location-type").textContent =
    `${place.city} | ${place.description}`;
  document.querySelector("#detail-price").textContent =
    `${place.price_range} Kr`;
  document.querySelector("#detail-description").textContent =
    place.text || place.abstract || place.description || "Beskrivning saknas.";
  document.querySelector("#detail-phone").textContent =
    place.phone_number || "Telefon saknas";
}

loadDetailPage();
