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
      return parsedTrips;
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

// Öppnar en resa och visar resans dagar
function openTrip(index) {
  selectedTripIndex = index;
  tripSectionHeading.hidden = true;
  tripList.hidden = true;
  tripMessage.hidden = true;
  tripDetails.hidden = false;
  renderTripDetails();
}

function closeTripDetails() {
  selectedTripIndex = null;
  tripDetails.hidden = true;
  tripSectionHeading.hidden = false;
  tripList.hidden = false;
}

// Visar vald resa och alla resans dagar
function renderTripDetails() {
  const trip = savedTrips[selectedTripIndex];

  if (!trip) {
    closeTripDetails();
    return;
  }

  selectedTripName.textContent = trip.name;
  selectedTripDate.textContent =
    `${formatDate(trip.startDate)} · ${trip.days} dagar`;

  renderTripDays(trip);
}

function renderTripDays(trip) {
  tripDaysContainer.innerHTML = "";

  for (let day = 1; day <= trip.days; day++) {
    const dayCard = document.createElement("section");
    const dayTitle = document.createElement("h3");
    const dayDate = document.createElement("p");
    const emptyText = document.createElement("p");

    dayCard.classList.add("trip-day-card");
    dayTitle.textContent = `Dag ${day}`;
    dayDate.textContent = getDayDate(trip.startDate, day);
    emptyText.textContent = "Inga platser planerade denna dag.";
    dayDate.classList.add("text-faded");
    emptyText.classList.add("text-faded");

    dayCard.append(dayTitle, dayDate, emptyText);
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
