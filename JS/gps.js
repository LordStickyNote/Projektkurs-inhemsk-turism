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
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        locationStatus.textContent = `Din position är ${lat}, ${lng}`;
      },
      () => {
        locationStatus.textContent = "Kunde inte hämta din plats.";
      },
    );
  });
}
