import { getData } from "./api.js";
import { categories } from "./categories.js";
import { renderSeeAndDo } from "./renderSeeAndDo.js";
import { renderFood } from "./renderFood.js";
import { renderAccommodation } from "./renderAccommodation.js";

// const attraction = categories.seeAndDo.sections[0]
// const see = await getData(attraction.controller);

// for (const name of see) {
//     console.log(name.name)
// }

// async function loadSeeAndDoConsole() {
//     for (const section of categories.seeAndDo.sections) {
//         const data = await getData(section.controller);

//         for (const name of data) {
//             console.log(name.name)
//         }
//     }
    
// }

document.querySelector("#doBtn").addEventListener("click", loadSeeAndDo)
document.querySelector("#foodBtn").addEventListener("click", loadFood)
document.querySelector("#accommodationBtn").addEventListener("click", loadAccommodation)

const container = document.getElementById("results")

async function loadSeeAndDo() {
    const sectionsData = [];

    for (const section of categories.seeAndDo.sections) {
        const items = await getData(section.controller, section.filters)

        sectionsData.push({
            title: section.title,
            items: items
        })
    }

    renderSeeAndDo(sectionsData, container)
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