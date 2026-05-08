import { getData } from "./api.js";
import { categories } from "./categories.js";
import { renderSeeAndDo } from "./renderSeeAndDo.js";
import { renderFood } from "./renderFood.js";
import { renderAccommodation } from "./renderAccommodation.js";
import { renderMap } from "./map.js";
import {
  activityTypeMap,
  buildActivityApiFilters,
  buildAttractionApiFilters,
  attractionTypeMap,
  filterByEstablishmentIds,
  getMaxPrice,
  filterFood,
  buildAccommodationApiFilters,
  buildFoodApiFilters,
} from "./filters.js";

document.querySelector("#doBtn").addEventListener("click", loadSeeAndDo);
document.querySelector("#foodBtn").addEventListener("click", loadFood);
document
  .querySelector("#accommodationBtn")
  .addEventListener("click", loadAccommodation);

let currentPage = 1;
const perPage = 20;

// Håller koll på vilken huvudkategori användaren är inne på. Behövs då kommunfiltret används av flera kategorier.
let activeCategory = "";

// Håller koll om användaren visar karta eller lista.
let currentView = "list";

// Senaste filtrerade datan som ska renderas, används av både lista och karta.
let currentSections = [];

// Ett sorts cacheminne för establishment-data.
let allEstablishments = [];

const globalMunicipalityFilter = document.getElementById("globalMunicipalityFilter",);
const container = document.getElementById("results");
const seeAndDoFilters = document.getElementById("SeeAndDoFilters");
const foodFilters = document.getElementById("foodFilters");

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

const accommodationFilters = document.getElementById("accommodationFilters");
const accommodationType = document.getElementById("accommodationType");
const accommodationRating = document.getElementById("accommodationRating");
const hasWifi = document.getElementById("hasWifi");
const freeParking = document.getElementById("freeParking");
const petFriendly = document.getElementById("petFriendly");

const toggleButtons = document.getElementById("toggleButtons");

const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageNumber = document.getElementById("pageNumber");
const pagination = document.getElementById("pagination")
pagination.hidden = true;

nextPageBtn.addEventListener("click", () => {
  currentPage++;
  pageNumber.textContent = currentPage;
  reloadCurrentCategory();
  scrollToTop();
})

prevPageBtn.addEventListener("click", () => {
  if (currentPage === 1) return;

  currentPage--;
  pageNumber.textContent = currentPage;
  reloadCurrentCategory();
  scrollToTop();
})

// Sparar ALLA activites/attractions från API (innan filtrering)
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
  input.addEventListener("change", applyFoodFilters);
}

const accommodationInputs =
  accommodationFilters.querySelectorAll("select, input");
for (const input of accommodationInputs) {
  input.addEventListener("change", applyAccommodationFilters);
}

function setFilterGroupDisabled(filterGroup, disabled) {
  const inputs = filterGroup.querySelectorAll("select, input");

  for (const input of inputs) {
    input.disabled = disabled;
  }

  filterGroup.classList.toggle("disabled", disabled);
}

// Pagination används bara när inga lokala/cross-controller-filter riskerar att missa data.
function shouldUsePagination() {
  if (currentView === "map") {
    return false;
  }

  const hasFoodType = activeCategory === "food" && foodType.value;
  const hasEstablishmentFilters = municipalityFilter.value || priceRange.value;

  return !hasFoodType && !hasEstablishmentFilters;
}

// Kör rätt filterfunktion beroende på vilken kategori som är aktiv.
function applyCurrentFilters() {
  if (activeCategory === "food") {
    applyFoodFilters();
  }

  if (activeCategory === "seeAndDo") {
    applySeeAndDoFilters();
  }

  if (activeCategory === "accommodation") {
    applyAccommodationFilters();
  }
}

// Gömmer alla filter innan rätt filter visas genom respektive funktion.
function hideFilters() {
  seeAndDoFilters.hidden = true;
  foodFilters.hidden = true;
  accommodationFilters.hidden = true;
  toggleButtons.hidden = true;
}

function skeletonLoaders() {
  container.innerHTML = `
  <section class="grid gap-6">
  <div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div><div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div><div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div><div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div>
      </section>`;
}

// Funktion för att köra "Se och göra" kategorin.
async function loadSeeAndDo() {
  setActiveCategoryButton("doBtn");

  activeCategory = "seeAndDo";
  currentPage = 1;

  skeletonLoaders();
  hideFilters();
  const usePagination = shouldUsePagination();

  globalMunicipalityFilter.hidden = false;
  seeAndDoFilters.hidden = false;
  toggleButtons.hidden = false;

  // Array som innehåller sektioner med titel + data från SMAPI
  const sectionsData = [];

  // Loopar igenom sections (activity + attraction, se categories.js)
  for (const section of categories.seeAndDo.sections) {
    // Hämtar data från SMAPI. Items är en array från SMAPI med de olika platserna
    const items = await getData(
      section.controller,
      section.filters,
      usePagination ? currentPage : null,
      usePagination ? perPage : null,
    );

    if (section.controller === "activity") {
      allActivities = items;
    }

    if (section.controller === "attraction") {
      allAttractions = items;
    }

    const cardItems = await useEstablishmentForCards(items);
    // Struktur för render-funktionen. Innehåller titeln för sektionen + alla objekt från SMAPI
    sectionsData.push({
      items: cardItems,
    });
  }

  currentSections = sectionsData;
  currentRenderFunction = renderSeeAndDo;
  renderCurrentView();
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
  const usePagination = shouldUsePagination();

  // Om inget "typ av aktivitet"-filter är valt hämtas "activity"-objekt direkt från SMAPI
  if (!selectedType) {
    return await getData(
      "activity",
      apiFilters,
      usePagination ? currentPage : null,
      usePagination ? perPage : null,
    );
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
      usePagination ? currentPage : null,
      usePagination ? perPage : null,
    );
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

  const usePagination = shouldUsePagination();

  // Om ingen typ är vald hämtas sevärdheter med övriga filter
  if (!selectedType) {
    return await getData(
      "attraction",
      apiFilters,
      usePagination ? currentPage : null,
      usePagination ? perPage : null,
    );
  }

  // Hämtar de SMAPI-kategorierna som hör till vald typ från filter.js.
  const attractionCategories = attractionTypeMap[selectedType];

  // Skapar ett anrop till SMAPI per kategori
  const requests = attractionCategories.map((category) => {
    return getData(
      "attraction",
      {
        ...apiFilters,
        categories: category,
      },
      usePagination ? currentPage : null,
      usePagination ? perPage : null,
    );
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
    attractionType.value || experienceType.value || localSignificance.checked
  );
}

//-------------------------------------------------------------------------

// Funktion som körs när filter ändras under "Se och göra"
async function applySeeAndDoFilters(resetPage = true) {
    if (resetPage) {
    currentPage = 1;
  }

  skeletonLoaders();

  const activityActive = hasActiveActivityFilters();
  const attractionActive = hasActiveAttractionFilters();

  // Om bara aktivitets-filter används stängs sevärdhetsfiltret ner och resultaten visar endast aktiviteter
  if (activityActive && !attractionActive) {
    setFilterGroupDisabled(attractionFilters, true);
    setFilterGroupDisabled(activityFilters, false);

    let activities = await getFilteredActivities();

    activities = await filterByEstablishment(activities);
    activities = await useEstablishmentForCards(activities);

    currentSections = [
      {
        items: activities,
      },
    ];

    currentRenderFunction = renderSeeAndDo;
    renderCurrentView();

    return;
  }

  // Om bara sevärdhetsfilter används stängs aktivitetsfiltren ner och resultatet visar bara servärdheter
  if (attractionActive && !activityActive) {
    setFilterGroupDisabled(activityFilters, true);
    setFilterGroupDisabled(attractionFilters, false);

    let attractions = await getFilteredAttractions();

    attractions = await filterByEstablishment(attractions);
    attractions = await useEstablishmentForCards(attractions);

    currentSections = [
      {
        items: attractions,
      },
    ];

    currentRenderFunction = renderSeeAndDo;
    renderCurrentView();

    return;
  }

  // Om inga filter är aktiva visas resultat från både aktiviter och sevärdheter
  let activities = await getFilteredActivities();
  let attractions = await getFilteredAttractions();

  activities = await filterByEstablishment(activities);
  attractions = await filterByEstablishment(attractions);

  activities = await useEstablishmentForCards(activities);
  attractions = await useEstablishmentForCards(attractions);

  currentSections = [
    {
      items: [...activities, ...attractions],
    },
  ];

  renderCurrentView(renderSeeAndDo);

  // Aktiverar båda filtergrupperna
  setFilterGroupDisabled(activityFilters, false);
  setFilterGroupDisabled(attractionFilters, false);
}

async function getAllEstablishments() {
  if (allEstablishments.length === 0) {
    allEstablishments = await getData("establishment");
  }

  return allEstablishments;
}

// Lägger på establishmentinformation på objekt från andra controllers. Behövs för bland annat hämta stad då detta inte återfinns i controllers som activity/attraction/food osv.
async function useEstablishmentForCards(items) {
  const establishments = await getAllEstablishments();

  // Hittar matchande establishment med samma ID som objektet (items)
  return items.map((item) => {
    const establishment = establishments.find(
      (place) => String(place.id) === String(item.id),
    );

    return {
      ...item, // Behåller controller-specifik data
      ...establishment, // lägger till visningsdata för resultatskorten
    };
  });
}

// Funktion för att filtrera platser beroende på vald kommun. Filtreras via establishment.
async function filterByEstablishment(items, controller) {
  const municipality = municipalityFilter.value;
  const maxPrice = Number(priceRange.value);

  // Hämtar alla objekt som är i vald kommun direkt i anropet
  let establishments = await getData("establishment", {
    ...(municipality && { municipalities: municipality }),
  });

  // Filtrerar pris lokalt på establishment-datan
  if (maxPrice) {
    establishments = establishments.filter((place) => {
      const placeMax = getMaxPrice(place.price_range);
      return placeMax <= maxPrice;
    });
  }

  // Matchar filtrerade establishments mot akutell controller-dataƒ
  return filterByEstablishmentIds(items, establishments, controller);
}

// Hämtar alla kommuner från establishment och fyller dropdown meny.
async function loadMunicipalities() {
  const establishments = await getData("establishment");

  // Plockar ut alla kommunnamn
  const municipalities = establishments
    .map((item) => item.municipality)
    .filter((municipality) => municipality);

  // Tar bort dubletter och sorterar kommunerna alfabetiskt.
  const alfabeticalMunicipalities = [...new Set(municipalities)].sort();

  for (const municipality of alfabeticalMunicipalities) {
    const option = document.createElement("option");

    option.value = municipality;
    option.textContent = municipality;

    municipalityFilter.appendChild(option);
  }
}

//-------------------------------------------------------------------------

// Läser av alla filtervärden för mat-kategorin
function getFoodFilterValues() {
  // Samlar formulärdata i ett objekt
  return {
    type: foodType.value,
    maxPrice: foodPrice.value,
    minRating: foodRating.value,
  };
}

// Körs när användaren andrar något mat-filter
async function applyFoodFilters(resetPage = true) {
  if (resetPage) {
    currentPage = 1;
  }

  skeletonLoaders();

  const food = categories.food;
  const values = getFoodFilterValues();
  const apiFilters = buildFoodApiFilters(values);

  const usePagination = shouldUsePagination();

  // Hämtar alla matobjekt från food-controllern.
  let items = await getData(
    food.controller,
    apiFilters,
    usePagination ? currentPage : null,
    usePagination ? perPage : null,
  );

  // Filtrerar mat lokalt i JS.
  items = filterFood(items, getFoodFilterValues());

  // Filtrear på gemensam establishment-data t.ex. kommun och pris.
  items = await filterByEstablishment(items, "food");

  // Lägger på establishment-data så korten får namn, plats, rating osv.
  items = await useEstablishmentForCards(items);

  // Sparar resultatet globalt så både lista och karta kan rendera samma data.
  currentSections = [
    {
      items: items,
    },
  ];

  // Anger vilken renderfunktion som ska användas.
  currentRenderFunction = renderFood;

  // Renderar aktuell vy, lista eller karta.
  renderCurrentView();
}

// Laddar startsidan var mat kategorin.
async function loadFood() {
  setActiveCategoryButton("foodBtn");

  activeCategory = "food";
  currentPage = 1;

  skeletonLoaders();
  hideFilters();
  const usePagination = shouldUsePagination();

  foodFilters.hidden = false;
  globalMunicipalityFilter.hidden = false;
  toggleButtons.hidden = false;

  const food = categories.food;
  let items = await getData(
    food.controller,
    food.filters,
    usePagination ? currentPage : null,
    usePagination ? perPage: null,
  );
  items = await useEstablishmentForCards(items);

  currentSections = [
    {
      items: items,
    },
  ];

  currentRenderFunction = renderFood;
  renderCurrentView();
}

// Samlar alla filtervärden för boenden.
function getAccommodationFilterValues() {
  return {
    type: accommodationType.value,
    minRating: accommodationRating.value,
    hasWifi: hasWifi.checked,
    freeParking: freeParking.checked,
    petFriendly: petFriendly.checked,
  };
}

// Körs när användaren ändrar boendefilter.
async function applyAccommodationFilters(resetPage = true) {
    if (resetPage) {
    currentPage = 1;
  }

  skeletonLoaders();

  // Hämtar aktuella filter-värden
  const values = getAccommodationFilterValues();

  // Bygger API-filter som accommodation-controllern förstår.
  const apiFilters = buildAccommodationApiFilters(values);

  const usePagination = shouldUsePagination();

  let items = await getData(
    "accommodation",
    apiFilters,
    usePagination ? currentPage : null,
    usePagination ? perPage : null,
  );

  // Hämtar filtrerande boenden direkt från SMAPI.
  items = await filterByEstablishment(items, "accommodation");

  items = await useEstablishmentForCards(items);

  currentSections = [
    {
      items: items,
    },
  ];

  currentRenderFunction = renderAccommodation;
  renderCurrentView();
}

// Laddar startsida för boenden.
async function loadAccommodation() {
  setActiveCategoryButton("accommodationBtn");

  activeCategory = "accommodation";
  currentPage = 1;

  skeletonLoaders();
  const accommodation = categories.accommodation;
  hideFilters();
  const usePagination = shouldUsePagination();

  accommodationFilters.hidden = false;
  globalMunicipalityFilter.hidden = false;
  toggleButtons.hidden = false;

  let items = await getData(
    accommodation.controller,
    accommodation.filters,
    usePagination ? currentPage : null,
    usePagination ? perPage : null,
  );

  items = await useEstablishmentForCards(items);

  currentSections = [
    {
      items: items,
    },
  ];

  currentRenderFunction = renderAccommodation;
  renderCurrentView();
}

//-------------------------------------------------------------------------

document.getElementById("listViewBtn").addEventListener("click", () => {
  currentView = "list";
  applyCurrentFilters();
});

document.getElementById("mapViewBtn").addEventListener("click", () => {
  currentView = "map";
  applyCurrentFilters();
});

let currentRenderFunction = renderSeeAndDo;

// Renderar antingen karta eller lista bereonde på currentView
function renderCurrentView() {
  if (currentView === "map") {
    pagination.hidden = true;
    renderMap(currentSections, container);
    return;
  }

   if (currentRenderFunction === renderSeeAndDo) {
    renderSeeAndDo(currentSections, container);
  } else {
   currentRenderFunction(currentSections[0].items, container); 
  }

    updatePaginationControls();
  }

function reloadCurrentCategory() {
  if (activeCategory === "food") {
    applyFoodFilters(false);
  }

  if (activeCategory === "seeAndDo") {
    applySeeAndDoFilters(false);
  }

  if (activeCategory === "accommodation") {
    applyAccommodationFilters(false);
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}

function updatePaginationControls() {
  const usePagination = shouldUsePagination();

  if (!activeCategory) {
    pagination.hidden = true;
    return;
  }

  pagination.hidden = false;

  pageNumber.textContent = currentPage;

  if (!usePagination) {
    pageNumber.textContent = "1";
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    return;
  }

  prevPageBtn.disabled = currentPage === 1;

  let hasNextPage = false;

  for (const section of currentSections) {
    if (section.items.length === perPage) {
      hasNextPage = true;
    }
  }

  nextPageBtn.disabled = !hasNextPage;
}

function setActiveCategoryButton(activeButtonId) {
  const buttons = document.querySelectorAll(".tab");

  for (const button of buttons) {
    button.classList.remove("active");
  }

  document.getElementById(activeButtonId).classList.add("active");
}