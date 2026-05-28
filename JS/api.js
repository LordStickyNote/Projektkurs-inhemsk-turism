import { API_KEY } from "./config.js";

const BASE_URL = "https://smapi.lnu.se/api/";

const apiCache = {};

export async function getData(
  controller,
  filters = {},
) {
  const cacheKey = JSON.stringify({
    controller,
    filters,
  });

  if (apiCache[cacheKey]) {
    return apiCache[cacheKey];
  }

  const params = new URLSearchParams({
    api_key: API_KEY,
    controller: controller,
    method: "getall",
    ...filters,
  });

  const url = `${BASE_URL}?${params}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Något gick fel!");
    }

    const data = await response.json();

    apiCache[cacheKey] = data.payload;

    return data.payload;
  } catch (error) {
    console.error("Fel vid hämtning av SMAPI:", error);
  }
}

export async function getReviews(id) {

    const params = new URLSearchParams({
    api_key: API_KEY,
    controller: "establishment",
    method: "getreviews",
    id,
  });

  const url = `${BASE_URL}?${params}`;

  try {

    const response = await fetch(url);

    const data = await response.json();

    return data.payload;
  } catch (error) {

    console.error("Fel vid hämtning av recensioner", error);

  }
}

export async function getNearbyPlaces(lat, lng) {

    const params = new URLSearchParams({
    api_key: API_KEY,
    controller: "establishment",
    method: "getfromlatlng",
    lat,
    lng,
    radius: 10,
  });

  const url = `${BASE_URL}?${params}`;

  try {

    const response = await fetch(url);

    const data = await response.json();

    return data.payload;
  } catch (error) {

    console.error("Fel vid hämtning av närliggande platser", error);

    return [];
  }
}