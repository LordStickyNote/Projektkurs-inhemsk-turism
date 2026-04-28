import { getData } from "./api.js";
import { categories } from "./categories.js";
import { renderSeeAndDo } from "./renderSeeAndDo.js";

// const attraction = categories.seeAndDo.sections[0]
// const see = await getData(attraction.controller);

// for (const name of see) {
//     console.log(name.name)
// }

document.querySelector("button").addEventListener("click", loadSeeAndDoConsole)

async function loadSeeAndDoConsole() {
    for (const section of categories.seeAndDo.sections) {
        const data = await getData(section.controller);

        for (const name of data) {
            console.log(name.name)
        }
    }
    
}

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

loadSeeAndDo()