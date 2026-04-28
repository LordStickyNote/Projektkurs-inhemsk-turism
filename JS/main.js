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
seeFilter.addEventListener("change", loadSeeAndDo)

const container = document.getElementById("results");

const activityFilters = document.getElementById("activityFilters");
const activityType = document.getElementById("activityType");
const effort = document.getElementById("effort");
const childFriendly = document.getElementById("childFriendly");
const involvesAnimals = document.getElementById("involvesAnimals");
const involvesWater = document.getElementById("involvesWater");

let allActivities = [];

const inputs = activityFilters.querySelectorAll("select, input");
for (const input of inputs) {
    input.addEventListener("change", applyActivityFilters)
}

async function loadSeeAndDo() {
    const selectedType = seeFilter.value;

    activityFilters.hidden = selectedType !== "activity";
    seeFilter.hidden = false;

    const sectionsData = [];

    for (const section of categories.seeAndDo.sections) {

        if (selectedType !== "all" && section.controller !== selectedType) {
            continue;
        }

        const items = await getData(section.controller, section.filters)

        if (section.controller === "activity") {
            allActivities = items;
        }

        sectionsData.push({
            title: section.title,
            items: items
        })
    }

    renderSeeAndDo(sectionsData, container)
}

function applyActivityFilters() {
    const filters = {
        type: activityType.value,
        effort: effort.value,
        childFriendly: childFriendly.checked,
        involvesAnimals: involvesAnimals.checked,
        involvesWater: involvesWater.checked
    };

    const filtered = filterActivities(allActivities, filters);

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