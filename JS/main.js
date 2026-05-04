import { getData } from "./api.js";
import { categories } from "./categories.js";
import { renderSeeAndDo } from "./renderSeeAndDo.js";
import { renderFood } from "./renderFood.js";
import { renderAccommodation } from "./renderAccommodation.js";
import {
  activityTypeMap,
  buildActivityApiFilters,
  buildAttractionApiFilters,
  attractionTypeMap,
  filterByEstablishmentIds,
  getMaxPrice,
  filterFood
} from "./filters.js";

document.querySelector("#doBtn").addEventListener("click", loadSeeAndDo);
document.querySelector("#foodBtn").addEventListener("click", loadFood);
document.querySelector("#accommodationBtn").addEventListener("click", loadAccommodation);

let activeCategory = "";
const globalMunicipalityFilter = document.getElementById("globalMunicipalityFilter")
const container = document.getElementById("results");
const seeAndDoFilters = document.getElementById("SeeAndDoFilters")
const foodFilters = document.getElementById("foodFilters")

const childFriendly = document.getElementById("childFriendly");
const globalSeeAndDoFilters = document.getElementById("globalSeeAndDoFilters");
const municipalityFilter = document.getElementById("municipalityFilter");
const priceRange = document.getElementById("priceRange");

const activityFilters = document.getElementById("activityFilters");
const attractionFilters = document.getElementById("attractionFilters");
const activityType = document.getElementById("activityType");
const effort = document.getElementById("effort");
const involvesAnimals = document.getElementById("involvesAnimals");
const involvesWater = document.getElementById("involvesWater");
const attractionType = document.getElementById("attractionType");
const experienceType = document.getElementById("experienceType");
const localSignificance = document.getElementById("localSignificance");

const foodType = document.getElementById("foodType");
const foodPrice = document.getElementById("foodPrice");
const foodRating = document.getElementById("foodRating");

// Sparar ALLA activites från API (innan filtrering)
let allActivities = [];
let allAttractions = [];

const activityInputs = activityFilters.querySelectorAll("select, input");
for (const input of activityInputs) {
  input.addEventListener("change", applySeeAndDoFilters);
}

const attractionInputs = attractionFilters.querySelectorAll("select, input");
for (const input of attractionInputs) {
  input.addEventListener("change", applySeeAndDoFilters);
}

childFriendly.addEventListener("change", applySeeAndDoFilters);
municipalityFilter.addEventListener("change", applyCurrentFilters);
loadMunicipalities();
priceRange.addEventListener("change", applySeeAndDoFilters);

const foodInputs = foodFilters.querySelectorAll("select, input");
for (const input of foodInputs) {
  input.addEventListener("change", applyFoodFilters)
}

function setFilterGroupDisabled(filterGroup, disabled) {
  const inputs = filterGroup.querySelectorAll("select, input");

  for (const input of inputs) {
    input.disabled = disabled;
  }

  filterGroup.classList.toggle("disabled", disabled);
}

function applyCurrentFilters() {
  if (activeCategory === "food") {
    applyFoodFilters();
  }

  if (activeCategory === "seeAndDo") {
    applySeeAndDoFilters();
  }
}

function hideFilters() {
  seeAndDoFilters.hidden = true;
  foodFilters.hidden = true;
}

async function loadSeeAndDo() {
  activeCategory = "seeAndDo";
  container.innerHTML = "Laddar...";
  hideFilters()

  globalMunicipalityFilter.hidden = false;
  seeAndDoFilters.hidden = false;

  // Array som innehåller sektioner med titel + data från SMAPI
  const sectionsData = [];

  // Loopar igenom sections (activity + attraction, se categories.js)
  for (const section of categories.seeAndDo.sections) {
    // Hämtar data från SMAPI. Items är en array från SMAPI med de olika platserna
    const items = await getData(section.controller, section.filters);

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

//-------------------------------------------------------------------------

// Nödvändiga värden för att kunna filtrera beroende på användarens val, används senare i getFilteredActivities för att rendera resultatet.
function getActivityFilterValues() {
  return {
    effort: effort.value,
    childFriendly: childFriendly.checked,
    involvesAnimals: involvesAnimals.checked,
    involvesWater: involvesWater.checked,
  };
}

// Hämtar aktiviteter baserat på både API-filter och egna JS-filter
async function getFilteredActivities() {
  const apiFilters = buildActivityApiFilters(getActivityFilterValues()); // Hämtar API-filter
  const selectedType = activityType.value;

  // Om inget "typ av aktivitet"-filter är valt hämtas "activity"-objekt direkt från SMAPI
  if (!selectedType) {
    return await getData("activity", apiFilters);
  }

  // Hämtar alla "descriptions" som hör till vald typ av aktivitet
  const descriptions = activityTypeMap[selectedType];

  // Skapar flera API-anrop, ett per description
  const requests = descriptions.map((description) => {
    return getData("activity", {
      ...apiFilters,
      descriptions: description,
    });
  });

  // Väntar på att alla API-anrop ska bli klara
  const results = await Promise.all(requests);

  // flat() slår ihop allt till en enda lista
  return results.flat();
}

// Läser av användarens val i sevärdhetsfiltren
function getAttractionFilterValues() {
  return {
    experience: experienceType.value,
    childFriendly: childFriendly.checked,
    localSignificance: localSignificance.checked,
  };
}

//-------------------------------------------------------------------------

// Funktion för att hämta sevärdheter från SMAPI baserat på användarens val
async function getFilteredAttractions() {

  // Bygger filter som SMAPI förstår direkt, kopplas till funktion i filter.js  
  const apiFilters = buildAttractionApiFilters(getAttractionFilterValues());

  // Hämtar vald typ av sevärdhet i filtret. T.ex. Historia, natur etc.
  const selectedType = attractionType.value;

  // Om ingen typ är vald hämtas sevärdheter med övriga filter
  if (!selectedType) {
    return await getData("attraction", apiFilters);
  }

  // Hämtar de SMAPI-kategorierna som hör till vald typ från filter.js.
  const attractionCategories = attractionTypeMap[selectedType];

  // Skapar ett anrop till SMAPI per kategori
  const requests = attractionCategories.map((category) => {
    return getData("attraction", {
      ...apiFilters,
      categories: category,
    });
  });

  // Väntar tills alla anrop till SMAPI är klara
  const results = await Promise.all(requests);

  // Slår ihop allt från anropen till en än enda array som sedan kan användas vid rendering
  return results.flat();
}

//-------------------------------------------------------------------------

// Kollar om något activity-filter är aktivt
function hasActiveActivityFilters() {
  return (
    activityType.value ||
    effort.value ||
    involvesAnimals.checked ||
    involvesWater.checked
  );
}

// Kollar om något attraction-filter är aktivt
function hasActiveAttractionFilters() {
  return (
    attractionType.value ||
    experienceType.value ||
    localSignificance.checked
  );
}

//-------------------------------------------------------------------------

// Funktion som körs när filter ändras under "Se och göra"
async function applySeeAndDoFilters() {
  container.innerHTML = "Laddar...";

  const activityActive = hasActiveActivityFilters();
  const attractionActive = hasActiveAttractionFilters();

  // Om bara aktivitets-filter används stängs sevärdhetsfiltret ner och resultaten visar endast aktiviteter
  if (activityActive && !attractionActive) {
    setFilterGroupDisabled(attractionFilters, true);
    setFilterGroupDisabled(activityFilters, false);

    let activities = await getFilteredActivities();
    activities = await filterByEstablishment(activities);

    renderSeeAndDo(
      [
        {
          title: "Aktiviteter",
          items: activities,
        },
      ],
      container,
    );

    return;
  }

  // Om bara sevärdhetsfilter används stängs aktivitetsfiltren ner och resultatet visar bara servärdheter
  if (attractionActive && !activityActive) {
    setFilterGroupDisabled(activityFilters, true);
    setFilterGroupDisabled(attractionFilters, false);

    let attractions = await getFilteredAttractions();
    attractions = await filterByEstablishment(attractions);

    renderSeeAndDo(
      [
        {
          title: "Sevärdheter",
          items: attractions,
        },
      ],
      container,
    );

    return;
  }

  // Om inga filter är aktiva visas resultat från både aktiviter och sevärdheter
  let activities = await getFilteredActivities();
  let attractions = await getFilteredAttractions();

  activities = await filterByEstablishment(activities);
  attractions = await filterByEstablishment(attractions)

  renderSeeAndDo(
    [
      {
        title: "Aktiviteter",
        items: activities,
      },
      {
        title: "Sevärdheter",
        items: attractions,
      },
    ],
    container,
  );

  // Aktiverar båda filtergrupperna 
  setFilterGroupDisabled(activityFilters, false);
  setFilterGroupDisabled(attractionFilters, false);
}

// Funktion för att filtrera platser beroende på vald kommun
async function filterByEstablishment(items, controller) {
    const municipality = municipalityFilter.value;
    const maxPrice = Number(priceRange.value);

    // Hämtar alla objekt som är i vald kommun
    let establishments = await getData("establishment", {
       ...(municipality) && { municipalities: municipality }
    });

    if (maxPrice) {
      establishments = establishments.filter(place => {
        const placeMax = getMaxPrice(place.price_range);
        return placeMax <= maxPrice;
      })
    }

    return filterByEstablishmentIds(items, establishments, controller)
}

async function loadMunicipalities() {
  const establishments = await getData("establishment");

  const municipalities = establishments.map(item => item.municipality).filter(municipality => municipality);

  const alfabeticalMunicipalities = [...new Set(municipalities)].sort();

  for (const municipality of alfabeticalMunicipalities) {
    const option = document.createElement("option");

    option.value = municipality;
    option.textContent = municipality;

    municipalityFilter.appendChild(option);
  }
}

//-------------------------------------------------------------------------

function getFoodFilterValues() {
  return {
    type: foodType.value,
    maxPrice: foodPrice.value ? Number(foodPrice.value) : null,
    minRating: foodRating.value ? Number(foodRating.value) : null
  }
}

async function applyFoodFilters() {
  container.innerHTML = "Laddar...";

  const food = categories.food;
  let items = await getData(food.controller);

  items = filterFood(items, getFoodFilterValues());

  items = await filterByEstablishment(items, "food")

  renderFood(items, container)
}

async function loadFood() {
  activeCategory = "food";
  container.innerHTML = "Laddar...";
  hideFilters()

  foodFilters.hidden = false;
  globalMunicipalityFilter.hidden = false;

  const food = categories.food;
  const items = await getData(food.controller, food.filters);

  renderFood(items, container);
}

async function loadAccommodation() {
  const accommodation = categories.accomodation;

  const items = await getData(accommodation.controller, accommodation.filters);

  renderAccommodation(items, container);
}