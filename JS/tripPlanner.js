const tripFormModal = document.getElementById("tripFormModal");
const tripForm = document.getElementById("tripForm");
const tripName = document.getElementById("tripName");
const tripStartDate = document.getElementById("tripStartDate");
const tripDays = document.getElementById("tripDays");
const tripFormError = document.getElementById("tripFormError");

const createTripButtons = document.querySelectorAll(".create-trip-button");
const closeTripFormBtn = document.getElementById("closeTripFormBtn");
const cancelTripFormBtn = document.getElementById("cancelTripFormBtn");

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
  const startDate = tripStartDate.value;
  const days = Number(tripDays.value);

  if (name.length < 2) {
    tripFormError.textContent = "Resans namn måste ha minst två tecken.";
    tripName.focus();
    return;
  }

  if (!startDate) {
    tripFormError.textContent = "Välj ett startdatum.";
    tripStartDate.focus();
    return;
  }

  if (days < 1 || days > 14) {
    tripFormError.textContent = "Resan måste vara mellan 1 och 14 dagar.";
    tripDays.focus();
    return;
  }

  tripFormError.textContent =
    "Formuläret är klart. Resan sparas i nästa steg.";
});
