export const activityTypeMap = {
  fun: [
    "Nöjespark",
    "Temapark",
    "Nöjescenter",
    "Lekland",
    "Lekplats",
    "Biograf"
  ],

  sport: [
    "Golfbana",
    "Skateboardpark",
    "Bowlinghall",
    "Gokart",
    "Hälsocenter"
  ],

  adventure: [
    "Zipline",
    "Klippklättring",
    "Paintballcenter"
  ],

  nightlife: [
    "Nattklubb"
  ]
};

// Bygger upp ett filter-objekt som ska skickas till API:et för filtrering.
// Endast filter som API:et faktiskt förstår, finns direkt i datan inkluderas här
export function buildActivityApiFilters(values) {
  const filters = {};

  if (values.effort) {
    filters.physical_efforts = values.effort;
  }

  if (values.childFriendly) {
    filters.child_support = "Y";
  }

  if (values.involvesAnimals) {
    filters.involves_animals = "Y";
  }

  if (values.involvesWater) {
    filters.involves_water = "Y";
  }

  return filters;
}

export const attractionTypeMap = {
    history: ["HISTORY"],
    art: ["ART", "SOCIAL"],
    nature: ["NATURE & SCIENCE"],
    landmark: ["HISTORY"]
};

export function buildAttractionApiFilters(values) {
  const filters = {};

  if (values.experience === "interactive") {
    filters.interactive = "Y";
  }

  if (values.experience === "static") {
    filters.static_content = "Y";
  }

  if (values.childFriendly) {
    filters.child_friendly = "Y";
  }

  if (values.localSignificance) {
    filters.significances = "LOCAL"
  }

  return filters;
}

export function filterByEstablishmentIds(items, establishments, controller) {
    const allowedIds = establishments.map(place => place.id);
    return items.filter(item => allowedIds.includes(item.id))
}

export function getMaxPrice(priceRangeString) {
  if (!priceRangeString) return Infinity;

  const parts = priceRangeString.split("-");
  return Number(parts[1])
}

export function filterFood(items, filters) {
  let filtered = items;

  if (filters.types && filters.types.length > 0) {

  filtered = filtered.filter((item) => {
    const description = item.description?.toLowerCase() || "";
    const subType = item.sub_type?.toLowerCase() || "";
    const searchTags = item.search_tags?.toLowerCase() || "";

    for (const type of filters.types) {
      const lowerType = type.toLowerCase();

      if (
      description.includes(lowerType) ||
      subType.includes(lowerType) ||
      searchTags.includes(lowerType)
      ) {
        return true;
      }
    }

    return false;
  });
}

return filtered;
}

export function buildFoodApiFilters(values) {
  const filters = {};

  if (values.maxPrice) {
    filters.max_avg_dinner_pricing = values.maxPrice;
  }

  if (values.minRating) {
    filters.min_rating = values.minRating;
  }

  return filters;
}

export function buildAccommodationApiFilters(values) {
  const filters = {};

  if (values.types && values.types.length > 0) {
    filters.descriptions = values.types.join(",");
  }

  if (values.minRating) {
    filters.min_rating = values.minRating;
  }

  if (values.hasWifi) {
    filters.wifi = "Y";
  }

  if (values.freeParking) {
    filters.free_parking = "Y";
  }

  if (values.petFriendly) {
    filters.pet_friendly = "Y";
  }

  return filters;
}