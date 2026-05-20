import { PIXAYBAY_API_KEY } from "./config.js";

const imageCache = {};

export const imageQueries = {
    nature: "forest lake sweden hiking",
    history: "castle museum sweden",
    art: "art gallery museum",
    swim: "indoor swimming pool",
    adventure: "zipline climbing adventure",
    animals: "zoo family animals"
}

export const blockedWords = [
    "bikini",
    "swimsuit",
    "fire",
    "burning",
    "smoke",
    "weapon",
    "war"
]

export async function getPixabayImage(searchTerm, cacheKey) {
    if (imageCache[cacheKey]) {
        return imageCache[cacheKey];
    }

    const url = `https://pixabay.com/api/?key=${PIXAYBAY_API_KEY}` +
    `&q=${encodeURIComponent(searchTerm)}` +
    `&image_type=photo` +
    `&lang=sv` +
    `&safesearch=true` +
    `&per_page=6`;

    try {
    const response = await fetch(url);
    const data = await response.json();

    let image = null;

    if (data.hits.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.hits.length);

    image = data.hits[randomIndex].webformatURL;
  }

    imageCache[cacheKey] = image;

    return image;

    } catch (error) {
        console.error("Fel vid hämtning av Pixabay-bild", error);
        return null;
    }
}