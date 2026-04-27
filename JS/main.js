import { getData } from "./api.js";
import { categories } from "./categories.js";

// const attraction = categories.seeAndDo.sections[0]
// const see = await getData(attraction.controller);

// for (const name of see) {
//     console.log(name.name)
// }

document.querySelector("button").addEventListener("click", loadSeeAndDo)

async function loadSeeAndDo() {
    for (const section of categories.seeAndDo.sections) {
        const data = await getData(section.controller);

        for (const name of data) {
            console.log(name.name)
        }
    }
    
}