import { getData } from "./api.js";
import { categories } from "./categories.js";
import { renderSeeAndDo } from "./renderSeeAndDo.js";
import { renderFood } from "./renderFood.js";
import { renderAccommodation } from "./renderAccommodation.js";
import { filterActivities } from "./filters.js";

document.querySelector("#doBtn").addEventListener("click", loadSeeAndDo)
document.querySelector("#foodBtn").addEventListener("click", loadFood)
document.querySelector("#accommodationBtn").addEventListener("click", loadAccommodation)

const seeFilter = document.getElementById("seeFilter");
const container = document.getElementById("results");

const activityFilters = document.getElementById("activityFilters");
const activityType = document.getElementById("activityType");
const effort = document.getElementById("effort");
const childFriendly = document.getElementById("childFriendly");
const involvesAnimals = document.getElementById("involvesAnimals");
const involvesWater = document.getElementById("involvesWater");

// Sparar ALLA activites från API (innan filtrering)
let allActivities = [];

seeFilter.addEventListener("change", loadSeeAndDo)
const inputs = activityFilters.querySelectorAll("select, input");
for (const input of inputs) {
    input.addEventListener("change", applyActivityFilters)
}

async function loadSeeAndDo() {
    const selectedType = seeFilter.value;

    // Visar activity-filter bara om "activity" är valt
    activityFilters.hidden = selectedType !== "activity";
    seeFilter.hidden = false;

    // Array som innehåller sektioner med titel + data från SMAPI
    const sectionsData = [];

    // Loopar igenom sections (activity + attraction, se categories.js)
    for (const section of categories.seeAndDo.sections) {

        // Hoppar över fel kategori (t.ex. om man endast valt "Aktiviteter")
        if (selectedType !== "all" && section.controller !== selectedType) {
            continue;
        }

        // Hämtar data från SMAPI. Items är en array från SMAPI med de olika platserna
        const items = await getData(section.controller, section.filters)

        // Sparar activities separat så vi kan filtrera dom senare
        if (section.controller === "activity") {
            allActivities = items;
        }

        // Struktur för render-funktionen. Innehåller titeln för sektionen + alla objekt från SMAPI
        sectionsData.push({
            title: section.title,
            items: items
        })
    }

    renderSeeAndDo(sectionsData, container)
}

// Körs när användaren ändrar activity-filter
function applyActivityFilters() {
    const filters = {
        type: activityType.value,
        effort: effort.value,
        childFriendly: childFriendly.checked,
        involvesAnimals: involvesAnimals.checked,
        involvesWater: involvesWater.checked
    };

    // Filtrerar redan hämtad data
    const filtered = filterActivities(allActivities, filters);

    // Renderar den filtrerade activity sektionen
    renderSeeAndDo([
        {
            title: "Aktiviteter",
            items: filtered
        }
    ], container)
}

async function loadFood() {
    const food = categories.food;

    const items = await getData(food.controller, food.filters);

    renderFood(items, container)
}

async function loadAccommodation() {
    const accommodation = categories.accomodation;

    const items = await getData(accommodation.controller, accommodation.filters)

    renderAccommodation(items, container)
}