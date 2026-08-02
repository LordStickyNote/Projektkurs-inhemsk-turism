const tripFormModal = document.getElementById("tripFormModal");
const tripForm = document.getElementById("tripForm");
const tripName = document.getElementById("tripName");
const tripStartDate = document.getElementById("tripStartDate");
const tripDays = document.getElementById("tripDays");
const tripFormError = document.getElementById("tripFormError");
const tripList = document.getElementById("tripList");
const tripCount = document.getElementById("tripCount");
const tripEmptyState = document.querySelector(".trip-empty-state");
const tripMessage = document.createElement("p");
const tripSectionHeading = document.querySelector(".trip-section-heading");
const tripDetails = document.getElementById("tripDetails");
const backToTripsBtn = document.getElementById("backToTripsBtn");
const selectedTripName = document.getElementById("selectedTripName");
const selectedTripDate = document.getElementById("selectedTripDate");
const tripPlaceSelect = document.getElementById("tripPlaceSelect");
const tripDaySelect = document.getElementById("tripDaySelect");
const addPlaceBtn = document.getElementById("addPlaceBtn");
const tripPlaceMessage = document.getElementById("tripPlaceMessage");
const tripDaysContainer = document.getElementById("tripDaysContainer");

// Knappar som öppnar och stänger formuläret
const createTripButtons = document.querySelectorAll(".create-trip-button");
const closeTripFormBtn = document.getElementById("closeTripFormBtn");
const cancelTripFormBtn = document.getElementById("cancelTripFormBtn");

let savedTrips = loadTrips();
let messageTimer;
let selectedTripIndex = null;

tripMessage.classList.add("trip-message");
tripMessage.setAttribute("role", "status");
tripMessage.hidden = true;
tripList.before(tripMessage);

// Hämtar sparade resor när sidan laddas
function loadTrips() {
  const storedTrips = localStorage.getItem("savedTrips");

  if (!storedTrips) {
    return [];
  }

  try {
    const parsedTrips = JSON.parse(storedTrips);

    if (Array.isArray(parsedTrips)) {
      return parsedTrips.filter((trip) => {
        return (
          trip &&
          typeof trip.name === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(trip.startDate) &&
          Number.isInteger(trip.days) &&
          trip.days >= 1 &&
          trip.days <= 14
        );
      });
    }

    return [];
  } catch {
    return [];
  }
}

// Sparar resorna i webbläsaren
function saveTrips() {
  localStorage.setItem("savedTrips", JSON.stringify(savedTrips));
}

// Gör om datumet till svensk text
function formatDate(date) {
  const parts = date.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const swedishDate = new Date(year, month, day);

  return swedishDate.toLocaleDateString("sv-SE");
}

// Visar alla sparade resor
function renderTrips() {
  const oldTripCards = tripList.querySelectorAll(".trip-card");

  for (const card of oldTripCards) {
    card.remove();
  }

  tripEmptyState.hidden = savedTrips.length > 0;
  tripCount.textContent =
    savedTrips.length === 1 ? "1 resa" : `${savedTrips.length} resor`;

  for (const [index, trip] of savedTrips.entries()) {
    const card = document.createElement("article");
    const tripInformation = document.createElement("div");
    const name = document.createElement("h3");
    const date = document.createElement("p");
    const days = document.createElement("p");
    const cardButtons = document.createElement("div");
    const openButton = document.createElement("button");
    const removeButton = document.createElement("button");

    card.classList.add("trip-card");
    tripInformation.classList.add("trip-card-information", "stack", "gap-2");
    name.textContent = trip.name;
    date.textContent = `Startdatum: ${formatDate(trip.startDate)}`;
    days.textContent = `Antal dagar: ${trip.days}`;
    openButton.textContent = "Öppna resa";
    removeButton.textContent = "Ta bort resa";
    date.classList.add("text-faded");
    days.classList.add("text-faded");
    cardButtons.classList.add("trip-card-buttons");
    openButton.classList.add("btn", "btn-primary");
    openButton.type = "button";
    removeButton.classList.add("trip-remove-button");
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Ta bort resan ${trip.name}`);

    openButton.addEventListener("click", () => {
      openTrip(index);
    });

    removeButton.addEventListener("click", () => {
      removeTrip(index);
    });

    tripInformation.append(name, date, days);
    cardButtons.append(openButton, removeButton);
    card.append(tripInformation, cardButtons);
    tripList.append(card);
  }
}

// Tar bort en sparad resa efter bekräftelse
function removeTrip(index) {
  const trip = savedTrips[index];

  if (!trip) {
    return;
  }

  const shouldRemove = confirm(`Vill du ta bort resan "${trip.name}"?`);

  if (!shouldRemove) {
    return;
  }

  savedTrips.splice(index, 1);
  saveTrips();
  renderTrips();
  showTripMessage(`Resan "${trip.name}" har tagits bort.`);
}

// Visar ett kort meddelande när en resa har tagits bort
function showTripMessage(message) {
  clearTimeout(messageTimer);
  tripMessage.textContent = message;
  tripMessage.hidden = false;

  messageTimer = setTimeout(() => {
    tripMessage.hidden = true;
  }, 3000);
}

// Hämtar användarens sparade favoritplatser
function loadFavoritePlaces() {
  const storedFavorites = localStorage.getItem("favorites");

  if (!storedFavorites) {
    return [];
  }

  try {
    const favorites = JSON.parse(storedFavorites);
    return Array.isArray(favorites) ? favorites : [];
  } catch {
    return [];
  }
}

// Öppnar en resa och visar resans dagar
function openTrip(index) {
  if (!savedTrips[index]) {
    return;
  }

  selectedTripIndex = index;
  tripSectionHeading.hidden = true;
  tripList.hidden = true;
  tripMessage.hidden = true;
  tripPlaceMessage.textContent = "";
  tripDetails.hidden = false;
  renderTripDetails();
}

function closeTripDetails() {
  selectedTripIndex = null;
  tripDetails.hidden = true;
  tripSectionHeading.hidden = false;
  tripList.hidden = false;
}

// Visar vald resa, favoritplatser och alla dagar
function renderTripDetails() {
  const trip = savedTrips[selectedTripIndex];

  if (!trip) {
    closeTripDetails();
    return;
  }

  if (!Array.isArray(trip.plannedPlaces)) {
    trip.plannedPlaces = [];
  }

  selectedTripName.textContent = trip.name;
  selectedTripDate.textContent =
    `${formatDate(trip.startDate)} · ${trip.days} dagar`;

  renderPlaceOptions();
  renderDayOptions(trip.days);
  renderTripDays(trip);
}

function renderPlaceOptions() {
  const favorites = loadFavoritePlaces();
  tripPlaceSelect.innerHTML = "";

  if (favorites.length === 0) {
    const option = document.createElement("option");
    option.textContent = "Du har inga sparade favoritplatser";
    option.value = "";
    tripPlaceSelect.append(option);
    addPlaceBtn.disabled = true;
    return;
  }

  addPlaceBtn.disabled = false;

  for (const place of favorites) {
    const option = document.createElement("option");
    option.value = place.id;
    option.textContent = place.city
      ? `${place.name} – ${place.city}`
      : place.name;
    tripPlaceSelect.append(option);
  }
}

function renderDayOptions(numberOfDays) {
  tripDaySelect.innerHTML = "";

  for (let day = 1; day <= numberOfDays; day++) {
    const option = document.createElement("option");
    option.value = day;
    option.textContent = `Dag ${day}`;
    tripDaySelect.append(option);
  }
}

function renderTripDays(trip) {
  tripDaysContainer.innerHTML = "";

  for (let day = 1; day <= trip.days; day++) {
    const dayCard = document.createElement("section");
    const dayTitle = document.createElement("h3");
    const dayDate = document.createElement("p");
    const placeList = document.createElement("div");
    const placesForDay = trip.plannedPlaces.filter((place) => {
      return place.day === day;
    });

    dayCard.classList.add("trip-day-card");
    dayTitle.textContent = `Dag ${day}`;
    dayDate.textContent = getDayDate(trip.startDate, day);
    dayDate.classList.add("text-faded");
    placeList.classList.add("trip-day-places");

    if (placesForDay.length === 0) {
      const emptyText = document.createElement("p");
      emptyText.textContent = "Inga platser planerade denna dag.";
      emptyText.classList.add("text-faded");
      placeList.append(emptyText);
    }

    for (const place of placesForDay) {
      placeList.append(createPlannedPlace(place));
    }

    dayCard.append(dayTitle, dayDate, placeList);
    tripDaysContainer.append(dayCard);
  }
}

function getDayDate(startDate, day) {
  const date = new Date(`${startDate}T12:00:00`);
  date.setDate(date.getDate() + day - 1);

  return date.toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function createPlannedPlace(place) {
  const trip = savedTrips[selectedTripIndex];
  const placeRow = document.createElement("div");
  const placeInformation = document.createElement("div");
  const placeName = document.createElement("h4");
  const placeCity = document.createElement("p");
  const placeActions = document.createElement("div");
  const dayLabel = document.createElement("label");
  const daySelect = document.createElement("select");
  const removePlaceButton = document.createElement("button");

  placeRow.classList.add("trip-planned-place");
  placeInformation.classList.add("stack", "gap-1");
  placeActions.classList.add("trip-place-actions");
  dayLabel.classList.add("trip-move-label");
  placeName.textContent = place.name;
  placeCity.textContent = place.city || place.description || "Sparad plats";
  dayLabel.textContent = "Flytta till";
  placeCity.classList.add("text-faded");
  daySelect.setAttribute("aria-label", `Flytta ${place.name} till en annan dag`);
  removePlaceButton.textContent = "Ta bort";
  removePlaceButton.type = "button";
  removePlaceButton.classList.add("trip-remove-place");

  for (let day = 1; day <= trip.days; day++) {
    const option = document.createElement("option");
    option.value = day;
    option.textContent = `Dag ${day}`;
    option.selected = day === place.day;
    daySelect.append(option);
  }

  daySelect.addEventListener("change", () => {
    movePlaceToDay(place.id, Number(daySelect.value));
  });

  removePlaceButton.addEventListener("click", () => {
    removePlaceFromTrip(place.id);
  });

  placeInformation.append(placeName, placeCity);
  dayLabel.append(daySelect);
  placeActions.append(dayLabel, removePlaceButton);
  placeRow.append(placeInformation, placeActions);

  return placeRow;
}

function addPlaceToTrip() {
  const trip = savedTrips[selectedTripIndex];

  if (!trip) {
    closeTripDetails();
    return;
  }

  const favorites = loadFavoritePlaces();
  const selectedPlace = favorites.find((place) => {
    return String(place.id) === tripPlaceSelect.value;
  });

  if (!selectedPlace) {
    return;
  }

  const placeAlreadyAdded = trip.plannedPlaces.some((place) => {
    return String(place.id) === String(selectedPlace.id);
  });

  if (placeAlreadyAdded) {
    tripPlaceMessage.textContent = "Platsen finns redan med i resan.";
    return;
  }

  trip.plannedPlaces.push({
    id: selectedPlace.id,
    name: selectedPlace.name,
    city: selectedPlace.city,
    description: selectedPlace.description,
    day: Number(tripDaySelect.value),
  });

  saveTrips();
  tripPlaceMessage.textContent = `${selectedPlace.name} har lagts till.`;
  renderTripDays(trip);
}

function removePlaceFromTrip(placeId) {
  const trip = savedTrips[selectedTripIndex];

  if (!trip) {
    closeTripDetails();
    return;
  }

  trip.plannedPlaces = trip.plannedPlaces.filter((place) => {
    return String(place.id) !== String(placeId);
  });

  saveTrips();
  tripPlaceMessage.textContent = "Platsen har tagits bort från resan.";
  renderTripDays(trip);
}

// Flyttar en planerad plats till en annan dag
function movePlaceToDay(placeId, newDay) {
  const trip = savedTrips[selectedTripIndex];

  if (!trip || newDay < 1 || newDay > trip.days) {
    return;
  }

  const place = trip.plannedPlaces.find((plannedPlace) => {
    return String(plannedPlace.id) === String(placeId);
  });

  if (!place || place.day === newDay) {
    return;
  }

  place.day = newDay;
  saveTrips();
  tripPlaceMessage.textContent = `${place.name} flyttades till dag ${newDay}.`;
  renderTripDays(trip);
}

function openTripForm() {
  tripForm.reset();
  tripFormError.textContent = "";
  tripFormModal.hidden = false;
  document.body.classList.add("modal-open");
  tripName.focus();
}

function closeTripForm() {
  tripFormModal.hidden = true;
  document.body.classList.remove("modal-open");
}

for (const button of createTripButtons) {
  button.addEventListener("click", openTripForm);
}

closeTripFormBtn.addEventListener("click", closeTripForm);
cancelTripFormBtn.addEventListener("click", closeTripForm);
backToTripsBtn.addEventListener("click", closeTripDetails);
addPlaceBtn.addEventListener("click", addPlaceToTrip);

tripFormModal.addEventListener("click", (event) => {
  if (event.target === tripFormModal) {
    closeTripForm();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !tripFormModal.hidden) {
    closeTripForm();
  }
});

tripForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = tripName.value.trim();

  // Stoppar namn som bara innehåller mellanslag
  if (name.length < 2) {
    tripFormError.textContent = "Resans namn måste ha minst två tecken.";
    tripName.focus();
    return;
  }

  const newTrip = {
    name: name,
    startDate: tripStartDate.value,
    days: Number(tripDays.value),
  };

  savedTrips.push(newTrip);
  saveTrips();
  renderTrips();
  closeTripForm();
});

renderTrips();
