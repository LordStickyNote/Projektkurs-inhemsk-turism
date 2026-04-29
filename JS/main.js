import { getData } from "./api.js";
import { categories } from "./categories.js";
import { renderSeeAndDo } from "./renderSeeAndDo.js";
import { renderFood } from "./renderFood.js";
import { renderAccommodation } from "./renderAccommodation.js";
import { activityTypeMap, buildActivityApiFilters } from "./filters.js";
import { filterAttractions } from "./filters.js";

document.querySelector("#doBtn").addEventListener("click", loadSeeAndDo);
document.querySelector("#foodBtn").addEventListener("click", loadFood);
document
  .querySelector("#accommodationBtn")
  .addEventListener("click", loadAccommodation);

const container = document.getElementById("results");

const activityFilters = document.getElementById("activityFilters");
const attractionFilters = document.getElementById("attractionFilters")
const activityType = document.getElementById("activityType");
const effort = document.getElementById("effort");
const childFriendly = document.getElementById("childFriendly");
const involvesAnimals = document.getElementById("involvesAnimals");
const involvesWater = document.getElementById("involvesWater");

const attractionType = document.getElementById("attractionType");
const experienceType = document.getElementById("experienceType");
const attractionChildFriendly = document.getElementById("attractionChildFriendly");
const localSignificance = document.getElementById("localSignificance");

let currentPage = 1;
const perPage = 10;

// Sparar ALLA activites från API (innan filtrering)
let allActivities = [];
let allAttractions = [];

const activityInputs = activityFilters.querySelectorAll("select, input");
for (const input of activityInputs) {
  input.addEventListener("change", applyActivityFilters);
}

const attractionInputs = attractionFilters.querySelectorAll("select, input");

async function loadSeeAndDo() {
  container.innerHTML = "Laddar...";

  activityFilters.hidden = false;
  attractionFilters.hidden = false;

  // Array som innehåller sektioner med titel + data från SMAPI
  const sectionsData = [];

  // Loopar igenom sections (activity + attraction, se categories.js)
  for (const section of categories.seeAndDo.sections) {
    // Hämtar data från SMAPI. Items är en array från SMAPI med de olika platserna
    const items = await getData(
      section.controller,
      section.filters,
      currentPage,
      perPage,
    );

    if (section.controller === "activity") {
      allActivities = items;
    }

    if (section.controller === "attraction") {
      allAttractions = items;
    }

    // Struktur för render-funktionen. Innehåller titeln för sektionen + alla objekt från SMAPI
    sectionsData.push({
      items: items,
    });
  }

  renderSeeAndDo(sectionsData, container);
}

// Nödvändiga värden för att kunna filtrera beroende på användarens val, används senare i getFilteredActivities för att rendera resultatet.
function getActivityFilterValues() {
    return {
        effort: effort.value,
        childFriendly: childFriendly.checked,
        involvesAnimals: involvesAnimals.checked,
        involvesWater: involvesWater.checked
    }
}

// Hämtar aktiviteter baserat på både API-filter och egna JS-filter
async function getFilteredActivities() {
  const apiFilters = buildActivityApiFilters(getActivityFilterValues()); // Hämtar API-filter
  const selectedType = activityType.value;

  // Om inget "typ av aktivitet"-filter är valt hämtas "activity"-objekt direkt från SMAPI
  if (!selectedType) {
    return await getData("activity", apiFilters, currentPage, perPage);
  }

  // Hämtar alla "descriptions" som hör till vald typ av aktivitet
  const descriptions = activityTypeMap[selectedType];

  // Skapar flera API-anrop, ett per description
  const requests = descriptions.map((description) => {
    return getData(
      "activity",
      {
        ...apiFilters,
        descriptions: description,
      },
      currentPage,
      perPage,
    );
  });

  // Väntar på att alla API-anrop ska bli klara
  const results = await Promise.all(requests);

  // flat() slår ihop allt till en enda lista
  return results.flat();
}

// Körs när användaren ändrar activity-filter
async function applyActivityFilters() {
  currentPage = 1;
  container.innerHTML = "Laddar...";

  // Hämtar filtrerade aktiviteter (API + lokal JS-filtrering)
  const filteredItems = await getFilteredActivities();

  renderSeeAndDo(
    [
      {
        title: "Aktiviteter",
        items: filteredItems,
      },
    ],
    container,
  );
}

async function loadFood() {
  const food = categories.food;

  const items = await getData(food.controller, food.filters);

  renderFood(items, container);
}

async function loadAccommodation() {
  const accommodation = categories.accomodation;

  const items = await getData(accommodation.controller, accommodation.filters);

  renderAccommodation(items, container);
}