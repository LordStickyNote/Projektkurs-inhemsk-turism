import { API_KEY } from "./config.js";

const BASE_URL = "https://smapi.lnu.se/api/";

const apiCache = {};

export async function getData(
  controller,
  filters = {},
  page = null,
  perPage = null,
) {
  const cacheKey = JSON.stringify({
    controller,
    filters,
    page,
    perPage,
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

    apiCache[cacheKey] = data.payload;

    return data.payload;
  } catch (error) {
    console.error("Fel vid hämtning av SMAPI:", error);
  }
}

export async function getReviews(establishmentId) {

    const params = new URLSearchParams({
    api_key: API_KEY,
    controller: "establishment",
    method: "getreviews",
    establishment_id: establishmentId,
  });

  const url = `${BASE_URL}?${params}`;

  try {

    const response = await fetch(url);

    const data = await response.json();

    return data.payload;
  } catch (error) {

    console.error("Fel vid hämtning av recensioner", error);

    return [];
  }
}