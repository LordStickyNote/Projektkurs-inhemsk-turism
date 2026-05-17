import { PIXAYBAY_API_KEY } from "./config.js";

export async function getPixabayImage(searchTerm) {
    const url = `https://pixabay.com/api/?key=${PIXAYBAY_API_KEY}` +
    `&q=${encodeURIComponent(searchTerm)}` +
    `&image_type=photo` +
    `&per_page=10`;

    const response = await fetch(url);
    const data = await response.json();

    let image = null;

    if (data.hits.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.hits.length);

        image = data.hits[randomIndex].webformatURL;
    }

    return image;
}