import { API_KEY } from "./config.js";

const BASE_URL = "https://smapi.lnu.se/api/"

export async function getData(controller, filters = {}, page = null, perPage = null) {
    const params = new URLSearchParams({
        api_key: API_KEY,
        controller: controller,
        method: "getall",
        ...filters
    });

    if (page && perPage) {
        params.set("current_page", page);
        params.set("per_page", perPage);
    }

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