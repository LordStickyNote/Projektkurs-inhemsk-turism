import { API_KEY } from "./config.js";

const BASE_URL = "https://smapi.lnu.se/api/"

async function getData(controller) {
    const params = new URLSearchParams({
        api_key: API_KEY,
        controller: controller,
        method: "getall"
    });

    const url = `${BASE_URL}?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Något gick fel!");
        }
        const data = await response.json();

        return data.payload;
    } catch (error) {
        console.error("Fel vid hämtning av SMAPI:", error);
    }
}

const see = await getData("attraction");

for (const name of see) {
    console.log(name.name)
}