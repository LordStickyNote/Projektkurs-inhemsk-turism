import { getData } from "./api.js";
import { categories } from "./categories.js";

const attraction = categories.seeAndDo.sections[0]
const see = await getData(attraction.controller);

for (const name of see) {
    console.log(name.name)
}