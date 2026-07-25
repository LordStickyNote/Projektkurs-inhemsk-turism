const tripFormModal = document.getElementById("tripFormModal");
const tripForm = document.getElementById("tripForm");
const tripName = document.getElementById("tripName");
const tripStartDate = document.getElementById("tripStartDate");
const tripDays = document.getElementById("tripDays");
const tripFormError = document.getElementById("tripFormError");
const tripList = document.getElementById("tripList");
const tripCount = document.getElementById("tripCount");
const tripEmptyState = document.querySelector(".trip-empty-state");

// Knappar som öppnar och stänger formuläret
const createTripButtons = document.querySelectorAll(".create-trip-button");
const closeTripFormBtn = document.getElementById("closeTripFormBtn");
const cancelTripFormBtn = document.getElementById("cancelTripFormBtn");

let savedTrips = loadTrips();

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

  for (const trip of savedTrips) {
    const card = document.createElement("article");
    const name = document.createElement("h3");
    const date = document.createElement("p");
    const days = document.createElement("p");

    card.classList.add("trip-card", "stack", "gap-3");
    name.textContent = trip.name;
    date.textContent = `Startdatum: ${formatDate(trip.startDate)}`;
    days.textContent = `Antal dagar: ${trip.days}`;
    date.classList.add("text-faded");
    days.classList.add("text-faded");

    card.append(name, date, days);
    tripList.append(card);
  }
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
