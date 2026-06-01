import { getData } from "./api.js";
import { renderSeeAndDo } from "./renderSeeAndDo.js";
import { renderFood } from "./renderFood.js";
import { renderAccommodation } from "./renderAccommodation.js";
import { renderMap } from "./map.js";
import { getFavorites } from "./favorites.js";
import { renderDetailModal } from "./renderDetailModal.js";
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

const quizResults = JSON.parse(sessionStorage.getItem("quizResults"));

let showingQuizResults = false;

// Kopplar de tre huvudkategorierna med klick-event.
document.querySelector("#doBtn").addEventListener("click", loadSeeAndDo);
document.querySelector("#foodBtn").addEventListener("click", loadFood);
document
  .querySelector("#accommodationBtn")
  .addEventListener("click", loadAccommodation);

let visibleItems = 20;
const itemsPerLoad = 20;

// Håller koll på vilken huvudkategori användaren är inne på. Behövs då kommunfiltret används av flera kategorier.
let activeCategory = "";

// Håller koll om användaren visar karta eller lista.
let currentView = "list";

// Senaste filtrerade datan som ska renderas, används av både lista och karta.
let currentSections = [];

// Ett sorts cacheminne för establishment-data.
let allEstablishments = [];

// DOM-element: Globala huvudfilter och container för att ladda resultat
const container = document.getElementById("results");
const seeAndDoFilters = document.getElementById("SeeAndDoFilters");
const foodFilters = document.getElementById("foodFilters");
const filterBtn = document.getElementById("btn-float-SeeAndDo");

// DOM-element: Favorisera/spara platser
const favoritesBtn = document.getElementById("favoritesBtn");
const favoritesModal = document.getElementById("favoritesModal");
const favoriteResults = document.getElementById("favoriteResults");
const closeFavoritesBtn = document.getElementById("closeFavoritesBtn");
const favoritesCount = document.getElementById("favoritesCount");

// DOM-element: Knappar för filter
const filterMenu = document.getElementById("filter-menu-containerSeeAndDo");
const closeFilterBtn = document.getElementById("applyFilterBtn");

// DOM-element: gemensamma filter
const childFriendly = document.getElementById("childFriendly");
const municipalityFilter = document.getElementById("municipalityFilter");
const priceRange = document.getElementById("priceRange");

// DOM-element: aktivitets- och servärdhetsfiltren
const activityFilters = document.getElementById("activityFilters");
const attractionFilters = document.getElementById("attractionFilters");
const effort = document.getElementById("effort");
const involvesAnimals = document.getElementById("involvesAnimals");
const involvesWater = document.getElementById("involvesWater");
const experienceType = document.getElementById("experienceType");
const localSignificance = document.getElementById("localSignificance");

// DOM-element: mat-filter
const foodPrice = document.getElementById("foodPrice");
const foodRating = document.getElementById("foodRating");

// DOM-element: boende-filter
const accommodationFilters = document.getElementById("accommodationFilters");
const accommodationRating = document.getElementById("accommodationRating");
const hasWifi = document.getElementById("hasWifi");
const freeParking = document.getElementById("freeParking");
const petFriendly = document.getElementById("petFriendly");

// DOM-element: list/kart toggle
const listViewBtn = document.getElementById("listViewBtn");
const mapViewBtn = document.getElementById("mapViewBtn");

// DOM-element: paginering
const loadMoreBtn = document.getElementById("loadMoreBtn");

// DOM-element: sortering
const sortList = document.getElementById("sortList");
sortList.addEventListener("change", () => {
  if (showingQuizResults) {
    currentSections = [
      {
        items: sortItems(quizResults),
      },
    ];

    renderCurrentView();
    return;
  }

  reloadCurrentCategory();
});
const toggleAndSortingDiv = document.getElementById("toggleAndSortingDiv");

const resetFilterBtn = document.getElementsByClassName("resetFilterBtn");
document.addEventListener("click", (e) => {
  if (e.target.closest(".resetFilterBtn")) {
    resetFilters();
    resetButtonActive();
    reloadCurrentCategory();
  }
});

// Lyssnar efter ändringar i alla aktivitetsfiltren och kör handleFilterChange.
const activityInputs = activityFilters.querySelectorAll("select, input");
for (const input of activityInputs) {
  input.addEventListener("change", handleFilterChange);
}

// Lyssnar efter ändringar i alla sevärdhetsfiltren och kör handleFilterChange.
const attractionInputs = attractionFilters.querySelectorAll("select, input");
for (const input of attractionInputs) {
  input.addEventListener("change", handleFilterChange);
}

childFriendly.addEventListener("change", handleFilterChange);
municipalityFilter.addEventListener("change", handleFilterChange);
loadMunicipalities(); // Fyller kommunfiltret med alternativ när sidan laddas.
priceRange.addEventListener("change", handleFilterChange);

// Lyssnar på ändringar i alla mat-filter.
const foodInputs = foodFilters.querySelectorAll("select, input");
for (const input of foodInputs) {
  input.addEventListener("change", handleFilterChange);
}

// Lyssnar på ändringar i alla boenden-filter
const accommodationInputs =
  accommodationFilters.querySelectorAll("select, input");
for (const input of accommodationInputs) {
  input.addEventListener("change", handleFilterChange);
}

// Aktiverar eller inaktiverar alla inputs i en filtergrupp. Används i "Se och göra" så man endast kan filtrera på en kategori i taget.
function setFilterGroupDisabled(filterGroup, disabled) {
  const inputs = filterGroup.querySelectorAll("select, input");

  for (const input of inputs) {
    input.disabled = disabled;
  }

  filterGroup.classList.toggle("disabled", disabled);
}

// Uppdaterar list/karta-knapparna så att aktiv vy:s knapp är inaktiverad.
function updateViewButtons() {
  listViewBtn.classList.remove("view-active");
  mapViewBtn.classList.remove("view-active");

  if (currentView === "list") {
    listViewBtn.classList.add("view-active");
  }

  if (currentView === "map") {
    mapViewBtn.classList.add("view-active");
  }
}

// Kör rätt filterfunktion beroende på vilken kategori som är aktiv.
function applyCurrentFilters(resetPage = true) {
  resetButtonActive();

  if (activeCategory === "food") {
    applyFoodFilters(resetPage);
  } else if (activeCategory === "seeAndDo") {
    applySeeAndDoFilters(resetPage);
  } else if (activeCategory === "accommodation") {
    applyAccommodationFilters(resetPage);
  }
}

// Gömmer alla filter innan rätt filter visas genom respektive funktion.
function hideFilters() {
  seeAndDoFilters.hidden = true;
  foodFilters.hidden = true;
  accommodationFilters.hidden = true;
  toggleAndSortingDiv.hidden = false;
}

// Funktion för att köra skeleton-loaders innan de riktiga "korten" laddats in
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
      <div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div>
      <div class="card card-listing">
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

// Funktion för att köra en skeleton-loader som passar kartans mall
function mapSkeletonLoader() {
  container.innerHTML = `
  <div class="card card-listing map-skeleton-loader">
        <div class="sl-img"></div>
      </div>`;
}

// Funktion för att köra "Se och göra" kategorin.
async function loadSeeAndDo() {
  showingQuizResults = false;
  filterMenu.classList.remove("filter-menu-open");

  document.getElementById("page-content").classList.remove("quiz-layout");

  activeCategory = "seeAndDo";
  visibleItems = 20;

  updateViewButtons();
  resetFilters();
  resetButtonActive();
  setActiveCategoryButton("doBtn");

  if (currentView === "map") {
    mapSkeletonLoader();
  } else {
    skeletonLoaders();
  }

  showFiltersForCategory();

  const controllers = ["activity", "attraction"];

  // Kör requestsen parallella, snabbare laddning
  const results = await Promise.all(
    controllers.map(async (controller) => {
      const items = await getData(controller, getSortApiFilters());

      return useEstablishmentForCards(items);
    }),
  );

  const mergedItems = results.flat();
  // Struktur för render-funktionen. Innehåller titeln för sektionen + alla objekt från SMAPI

  const paginatedItems = paginateItems(mergedItems);

  currentSections = [
    {
      items: paginatedItems,
      totalItems: mergedItems.length,
    },
  ];

  currentRenderFunction = renderSeeAndDo;
  renderCurrentView();
}

//-------------------------------------------------------------------------

function getSelectedActivityTypes() {
  const checkedInputs = document.querySelectorAll(
    `input[name="activityType"]:checked`,
  );

  const selectedTypes = [];

  for (const input of checkedInputs) {
    selectedTypes.push(input.value);
  }

  return selectedTypes;
}

function getSelectedAttractionTypes() {
  const checkedInputs = document.querySelectorAll(
    `input[name="attractionType"]:checked`,
  );

  const selectedTypes = [];

  for (const input of checkedInputs) {
    selectedTypes.push(input.value);
  }

  return selectedTypes;
}

function getSelectedFoodTypes() {
  const checkedInputs = document.querySelectorAll(
    `input[name="foodType"]:checked`,
  );

  const selectedTypes = [];

  for (const input of checkedInputs) {
    selectedTypes.push(input.value);
  }

  return selectedTypes;
}

function getselectedAccommodationTypes() {
  const checkedInputs = document.querySelectorAll(
    `input[name="accommodationType"]:checked`,
  );

  const selectedTypes = [];

  for (const input of checkedInputs) {
    selectedTypes.push(input.value);
  }

  return selectedTypes;
}

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
  const apiFilters = {
    ...buildActivityApiFilters(getActivityFilterValues()),
    ...getSortApiFilters(),
  }; // Hämtar API-filter

  const selectedTypes = getSelectedActivityTypes();

  // Om inget "typ av aktivitet"-filter är valt hämtas "activity"-objekt direkt från SMAPI
  if (selectedTypes.length === 0) {
    return await getData("activity", apiFilters);
  }

  const requests = [];

  // Skapar flera API-anrop, ett per description
  for (const type of selectedTypes) {
    const descriptions = activityTypeMap[type];

    for (const description of descriptions) {
      requests.push(
        getData("activity", {
          ...apiFilters,
          descriptions: description,
        }),
      );
    }
  }

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
  const apiFilters = {
    ...buildAttractionApiFilters(getAttractionFilterValues()),
    ...getSortApiFilters(),
  };

  // Hämtar vald typ av sevärdhet i filtret. T.ex. Historia, natur etc.
  const selectedTypes = getSelectedAttractionTypes();

  // Om ingen typ är vald hämtas sevärdheter med övriga filter
  if (selectedTypes.length === 0) {
    return await getData("attraction", apiFilters);
  }

  const requests = [];

  for (const type of selectedTypes) {
    const categories = attractionTypeMap[type];

    for (const category of categories) {
      requests.push(
        getData("attraction", {
          ...apiFilters,
          categories: category,
        }),
      );
    }
  }

  // Väntar tills alla anrop till SMAPI är klara
  const results = await Promise.all(requests);

  // Slår ihop allt från anropen till en än enda array som sedan kan användas vid rendering
  return results.flat();
}

//-------------------------------------------------------------------------

// Kollar om något activity-filter är aktivt
function hasActiveActivityFilters() {
  return (
    getSelectedActivityTypes().length > 0 ||
    effort.value ||
    involvesAnimals.checked ||
    involvesWater.checked
  );
}

// Kollar om något attraction-filter är aktivt
function hasActiveAttractionFilters() {
  return (
    getSelectedAttractionTypes().length > 0 ||
    experienceType.value ||
    localSignificance.checked
  );
}

//-------------------------------------------------------------------------

// Funktion som körs när filter ändras under "Se och göra"
async function applySeeAndDoFilters(resetPage = true) {
  if (resetPage) {
    visibleItems = 20;
  }

  if (resetPage) {
    if (currentView === "map") {
      mapSkeletonLoader();
    } else {
      skeletonLoaders();
    }
  }

  const activityActive = hasActiveActivityFilters();
  const attractionActive = hasActiveAttractionFilters();

  // Om bara aktivitets-filter används stängs sevärdhetsfiltret ner och resultaten visar endast aktiviteter
  if (activityActive && !attractionActive) {
    setFilterGroupDisabled(attractionFilters, true);
    setFilterGroupDisabled(activityFilters, false);

    let activities = await getFilteredActivities();

    activities = await filterByEstablishment(activities);
    activities = await useEstablishmentForCards(activities);

    const totalItems = activities.length;

    const paginatedItems = paginateItems(activities);

    currentSections = [
      {
        items: paginatedItems,
        totalItems,
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

    const totalItems = attractions.length;

    const paginatedItems = paginateItems(attractions);

    currentSections = [
      {
        items: paginatedItems,
        totalItems,
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

  const mergedItems = [...activities, ...attractions];

  const totalItems = mergedItems.length;

  const paginatedItems = paginateItems(mergedItems);

  currentSections = [
    {
      items: paginatedItems,
      totalItems,
    },
  ];

  currentRenderFunction = renderSeeAndDo;
  renderCurrentView();

  // Aktiverar båda filtergrupperna
  setFilterGroupDisabled(activityFilters, false);
  setFilterGroupDisabled(attractionFilters, false);
}

// Hämtar alla establishments från SMAPI eller returnerar data som redan finns cachad.
async function getAllEstablishments() {
  const cached = localStorage.getItem("establishments");

  if (cached) {
    allEstablishments = JSON.parse(cached);
    return allEstablishments;
  }

  allEstablishments = await getData("establishment");

  localStorage.setItem("establishments", JSON.stringify(allEstablishments));

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

  let establishments;

  if (municipality) {
    establishments = await getData("establishment", {
      municipalities: municipality,
    });
  } else {
    establishments = await getAllEstablishments();
  }

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
    types: getSelectedFoodTypes(),
    maxPrice: foodPrice.value,
    minRating: foodRating.value,
  };
}

// Körs när användaren andrar något mat-filter
async function applyFoodFilters(resetPage = true) {
  if (resetPage) {
    visibleItems = 20;
  }

  if (resetPage) {
    if (currentView === "map") {
      mapSkeletonLoader();
    } else {
      skeletonLoaders();
    }
  }

  const values = getFoodFilterValues();
  const apiFilters = {
    ...buildFoodApiFilters(values),
    ...getSortApiFilters(),
  };

  // Hämtar alla matobjekt från food-controllern.
  let items = await getData("food", apiFilters);

  // Filtrerar mat lokalt i JS.
  items = filterFood(items, getFoodFilterValues());

  // Filtrear på gemensam establishment-data t.ex. kommun och pris.
  items = await filterByEstablishment(items, "food");

  // Lägger på establishment-data så korten får namn, plats, rating osv.
  items = await useEstablishmentForCards(items);

  // Sparar resultatet globalt så både lista och karta kan rendera samma data.
  const totalItems = items.length;

  const paginatedItems = paginateItems(items);

  currentSections = [
    {
      items: paginatedItems,
      totalItems,
    },
  ];

  // Anger vilken renderfunktion som ska användas.
  currentRenderFunction = renderFood;

  // Renderar aktuell vy, lista eller karta.
  renderCurrentView();
}

// Laddar startsidan var mat kategorin.
async function loadFood() {
  showingQuizResults = false;
  filterMenu.classList.remove("filter-menu-open");

  document.getElementById("page-content").classList.remove("quiz-layout");

  activeCategory = "food";
  visibleItems = 20;

  updateViewButtons();
  resetFilters();
  resetButtonActive();
  setActiveCategoryButton("foodBtn");

  if (currentView === "map") {
    mapSkeletonLoader();
  } else {
    skeletonLoaders();
  }

  showFiltersForCategory();

  let items = await getData("food", getSortApiFilters());
  items = await useEstablishmentForCards(items);

  const totalItems = items.length;

  const paginatedItems = paginateItems(items);

  currentSections = [
    {
      items: paginatedItems,
      totalItems,
    },
  ];

  currentRenderFunction = renderFood;
  renderCurrentView();
}

// Samlar alla filtervärden för boenden.
function getAccommodationFilterValues() {
  return {
    types: getselectedAccommodationTypes(),
    minRating: accommodationRating.value,
    hasWifi: hasWifi.checked,
    freeParking: freeParking.checked,
    petFriendly: petFriendly.checked,
  };
}

// Körs när användaren ändrar boendefilter.
async function applyAccommodationFilters(resetPage = true) {
  if (resetPage) {
    visibleItems = 20;
  }

  if (resetPage) {
    if (currentView === "map") {
      mapSkeletonLoader();
    } else {
      skeletonLoaders();
    }
  }

  // Hämtar aktuella filter-värden
  const values = getAccommodationFilterValues();

  // Bygger API-filter som accommodation-controllern förstår.
  const apiFilters = {
    ...buildAccommodationApiFilters(values),
    ...getSortApiFilters(),
  };

  let items = await getData("accommodation", apiFilters);

  // Hämtar filtrerande boenden direkt från SMAPI.
  items = await filterByEstablishment(items, "accommodation");

  items = await useEstablishmentForCards(items);

  const totalItems = items.length;

  const paginatedItems = paginateItems(items);

  currentSections = [
    {
      items: paginatedItems,
      totalItems,
    },
  ];

  currentRenderFunction = renderAccommodation;
  renderCurrentView();
}

// Laddar startsida för boenden.
async function loadAccommodation() {
  showingQuizResults = false;
  filterMenu.classList.remove("filter-menu-open");

  document.getElementById("page-content").classList.remove("quiz-layout");

  visibleItems = 20;

  activeCategory = "accommodation";

  updateViewButtons();
  resetFilters();
  resetButtonActive();
  setActiveCategoryButton("accommodationBtn");

  if (currentView === "map") {
    mapSkeletonLoader();
  } else {
    skeletonLoaders();
  }

  showFiltersForCategory();

  let items = await getData("accommodation", getSortApiFilters());

  items = await useEstablishmentForCards(items);

  const totalItems = items.length;

  const paginatedItems = paginateItems(items);

  currentSections = [
    {
      items: paginatedItems,
      totalItems,
    },
  ];

  currentRenderFunction = renderAccommodation;
  renderCurrentView();
}

//-------------------------------------------------------------------------

// Funktion som körs när knappen för listvy klickas.
listViewBtn.addEventListener("click", () => {
  currentView = "list";

  if (showingQuizResults) {
    renderCurrentView();
  } else {
    applyCurrentFilters();
  }

  updateViewButtons();
});

// Funktion som körs när knappen för kartvy klickas.
mapViewBtn.addEventListener("click", () => {
  currentView = "map";

  if (showingQuizResults) {
    renderCurrentView();
  } else {
    applyCurrentFilters();
  }

  updateViewButtons();
});

let currentRenderFunction = renderSeeAndDo;

// Renderar antingen karta eller lista bereonde på currentView
async function renderCurrentView() {
  updateViewButtons();
  updateResultsCount();

  if (currentView === "map") {
    renderMap(currentSections, container);
  } else if (currentRenderFunction === renderSeeAndDo) {
    await renderSeeAndDo(
      currentSections,
      container,
      visibleItems,
      itemsPerLoad,
    );
  } else {
    await currentRenderFunction(
      currentSections[0].items,
      container,
      visibleItems,
      itemsPerLoad,
    );
  }

  updateLoadMoreButton();
}

// Laddar om aktiv kategori utan att återställa sidnumreringen.
export function reloadCurrentCategory() {
  applyCurrentFilters(false);
}

// Scrollar mjukt till toppen av sidan, används vid sidbyte
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function paginateItems(items) {
  if (currentView === "map") {
    return items;
  }

  return items.slice(0, visibleItems);
}

loadMoreBtn.addEventListener("click", () => {
  visibleItems += itemsPerLoad;

  reloadCurrentCategory();
});

function updateLoadMoreButton() {
  if (currentView === "map") {
    loadMoreBtn.hidden = true;
    return;
  }

  const totalItems = currentSections[0]?.totalItems || 0;

  if (visibleItems >= totalItems) {
    loadMoreBtn.hidden = true;
  } else {
    loadMoreBtn.hidden = false;
  }
}

// Marker rätt huvudkategori som aktiv.
function setActiveCategoryButton(activeButtonId) {
  const buttons = document.querySelectorAll(".tab");

  for (const button of buttons) {
    button.classList.remove("active");
  }

  document.getElementById(activeButtonId).classList.add("active");
}

// Återställer alla filterfällt till standardvärde.
function resetFilters() {
  // Global
  municipalityFilter.value = "";
  priceRange.value = "";

  // "Se och göra"
  for (const input of document.querySelectorAll(`input[name="activityType"]`)) {
    input.checked = false;
  }
  effort.value = "";
  involvesAnimals.checked = false;
  involvesWater.checked = false;
  for (const input of document.querySelectorAll(
    `input[name="attractionType"]`,
  )) {
    input.checked = false;
  }
  experienceType.value = "";
  localSignificance.checked = false;
  childFriendly.checked = false;

  // "Mat"
  for (const input of document.querySelectorAll(`input[name="foodType"]`)) {
    input.checked = false;
  }
  foodPrice.value = "";
  foodRating.value = "";

  // "Boenden"
  for (const input of document.querySelectorAll(
    `input[name="accommodationType"]`,
  )) {
    input.checked = false;
  }
  accommodationRating.value = "";
  hasWifi.checked = false;
  freeParking.checked = false;
  petFriendly.checked = false;

  setFilterGroupDisabled(activityFilters, false);
  setFilterGroupDisabled(attractionFilters, false);

  updateFilterButton();
}

// Aktiverar eller inaktiverar "Återställ filter"-knappen beroende på om något filter är aktivt eller inte.
function resetButtonActive() {
  const hasActiveFilters =
    municipalityFilter.value ||
    getSelectedActivityTypes().length > 0 ||
    effort.value ||
    priceRange.value ||
    involvesAnimals.checked ||
    involvesWater.checked ||
    getSelectedAttractionTypes().length > 0 ||
    experienceType.value ||
    localSignificance.checked ||
    childFriendly.checked ||
    getSelectedFoodTypes().length > 0 ||
    foodPrice.value ||
    foodRating.value ||
    getselectedAccommodationTypes().length > 0 ||
    accommodationRating.value ||
    hasWifi.checked ||
    freeParking.checked ||
    petFriendly.checked;

  if (hasActiveFilters === false) {
    resetFilterBtn.disabled = true;
  } else {
    resetFilterBtn.disabled = false;
  }
}

function getActiveFilterCount() {
  let count = 0;

  if (municipalityFilter.value) count++;
  if (priceRange.value) count++;

  count += getSelectedActivityTypes().length;
  count += getSelectedAttractionTypes().length;

  if (effort.value) count++;
  if (involvesAnimals.checked) count++;
  if (involvesWater.checked) count++;
  if (experienceType.value) count++;
  if (localSignificance.checked) count++;
  if (childFriendly.checked) count++;

  count += getSelectedFoodTypes().length;
  if (foodPrice.value) count++;
  if (foodRating.value) count++;

  count += getselectedAccommodationTypes().length;
  if (accommodationRating.value) count++;
  if (hasWifi.checked) count++;
  if (freeParking.checked) count++;
  if (petFriendly.checked) count++;

  return count;
}

function updateFilterButton() {
  const count = getActiveFilterCount();

  if (count > 0) {
    filterBtn.classList.add("filter-active");

    filterBtn.innerHTML = `
    Filter
    <span class="filter-count">
    ${count}
    </span>
    `;
  } else {
    filterBtn.classList.remove("filter-active");

    filterBtn.innerHTML = `Filter`;
  }
}

export function updateResultsCount() {
  const resultsCount = document.getElementById("resultsCount");

  let total = 0;

  for (const section of currentSections) {
    total += section.totalItems || section.items.length;
  }

  resultsCount.textContent = `${total} platser hittades`;

  closeFilterBtn.innerHTML = `Visa resultat (${total})`;

  return total;
}

// Körs varje gång ett filtervärde ändras. Tillämpar filtrerna och uppdaterar "reset"-knappen.
function handleFilterChange() {
  applyCurrentFilters();
  resetButtonActive();
  updateFilterButton();
}

function showFiltersForCategory() {
  hideFilters();

  if (activeCategory === "seeAndDo") {
    seeAndDoFilters.hidden = false;
  } else if (activeCategory === "food") {
    foodFilters.hidden = false;
  } else if (activeCategory === "accommodation") {
    accommodationFilters.hidden = false;
  }
}

function getSortApiFilters() {
  if (sortList.value === "rating") {
    return {
      order_by: "rating",
      sort_in: "DESC",
    };
  }

  if (sortList.value === "name") {
    return {
      order_by: "name",
      sort_in: "ASC",
    };
  }

  return {};
}

function quizNotice() {
  const div = document.createElement("div");
  div.classList.add("quiz-notice");

  const button = document.createElement("button");
  button.classList.add("btn", "btn-primary");

  div.innerHTML = `
  <div class="quiz-notice-content">
  <h6>Visar personliga rekommendationer</h6>
  <p>Resultaten baseras på dina svar i quizet.
  </div>
  `;

  button.textContent = "Visa allt";

  button.addEventListener("click", () => {
    showingQuizResults = false;
    sessionStorage.removeItem("quizResults");
    document.getElementById("quizNoticeContainer").innerHTML = "";
    filterBtn.hidden = false;
    loadSeeAndDo();
  });

  div.append(button);

  document.getElementById("quizNoticeContainer").append(div);
}

function sortItems(items) {
  const sorted = [...items];

  if (sortList.value === "rating") {
    sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  }

  if (sortList.value === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "sv"));
  }

  return sorted;
}

if (quizResults) {
  showingQuizResults = true;
  visibleItems = 20;
  activeCategory = "seeAndDo";

  currentSections = [
    {
      items: sortItems(quizResults),
    },
  ];

  currentRenderFunction = renderSeeAndDo;
  renderCurrentView();
  setActiveCategoryButton("doBtn");

  toggleAndSortingDiv.hidden = false;

  filterBtn.hidden = true;
  filterMenu.classList.remove("filter-menu-open");

  document.getElementById("page-content").classList.add("quiz-layout");

  quizNotice();
} else {
  loadSeeAndDo();
}

function renderFavorites() {
  var favorites = getFavorites();

  document.getElementById("clear-favorites").addEventListener("click", () => {
    localStorage.removeItem("favorites");
    renderFavorites();
    updateFavoritesCount();

    var getFavoriteBtn = document.querySelectorAll(".favorite-btn.active");
    for (const btn of getFavoriteBtn) {
      btn.classList.remove("active");
    }
  });

  favoriteResults.innerHTML = "";

  if (favorites.length === 0) {
    favoriteResults.innerHTML = `<h3>Inga sparade platser ännu</h3>
                                <p>Tryck på hjärtat på ett kort för att spara det här</p>`;
  }

  for (const item of favorites) {
    const article = document.createElement("article");

    article.classList.add("favorite-item");

    article.tabIndex = "0";
    
    article.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        renderDetailModal(item);
        favoritesModal.hidden = true;
      }
    });

    article.innerHTML = `
    <div class="card">
      <h3>${item.name}</h3>
      <p>${item.city}</p>
    </div>
    `;

    article.addEventListener("click", () => {
      renderDetailModal(item);
      favoritesModal.hidden = true;
    });

    favoriteResults.append(article);
  }
}

export function updateFavoritesCount() {
  favoritesCount.textContent = getFavorites().length;
}

favoritesBtn.addEventListener("click", () => {
  renderFavorites();

  favoritesModal.hidden = false;
  document.getElementById("clear-favorites").focus();
});

closeFavoritesBtn.addEventListener("click", () => {
  favoritesModal.hidden = true;
});

filterBtn.addEventListener("click", () => {
  filterMenu.classList.add("filter-menu-open");

  document.querySelector("#resultsContainer").setAttribute("inert", "");
  document.querySelector("html").style.overflow = "hidden";
  document.querySelector("#lower-page-btns").setAttribute("inert", "");

  filterBtn.hidden = true;
});

closeFilterBtn.addEventListener("click", () => {
  filterMenu.classList.remove("filter-menu-open");

  document.querySelector("#resultsContainer").removeAttribute("inert");
  document.querySelector("html").style.overflow = "";
  document.querySelector("#lower-page-btns").removeAttribute("inert");

  filterBtn.hidden = false;
});

updateFavoritesCount();
