export function setupLocationFeature() {
  const useLocationBtn = document.getElementById("useLocationBtn");
  const locationStatus = document.getElementById("locationStatus");

  useLocationBtn.addEventListener("click", () => {
    locationStatus.textContent = "Knappen fungerar!";
  });
}
