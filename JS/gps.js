import { getNearbyPlaces } from "./api.js";

export function setupLocationFeature() {
  const useLocationBtn = document.getElementById("useLocationBtn");
  const locationStatus = document.getElementById("locationStatus");

  useLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = "Din webbläsare stödjer inte platsåtkomst.";
      return;
    }

    locationStatus.textContent = "Hämtar din position...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        locationStatus.textContent = "Hämtar platser nära dig...";

        const nearbyPlaces = await getNearbyPlaces(lat, lng);

        locationStatus.textContent = `${nearbyPlaces.length} platser hittades nära dig.`;

        console.log(nearbyPlaces);
      },
      () => {
        locationStatus.textContent = "Kunde inte hämta din plats.";
      },
    );
  });
}
