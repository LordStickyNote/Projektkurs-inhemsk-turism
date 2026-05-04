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

  swim: [
    "Simhall"
  ],

  animals: [
    "Djurpark",
    "Älgpark"
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

export function filterByEstablishmentIds(items, establishments) {
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

  if (filters.type) {
    const type = filters.type.toLowerCase();
  

  filtered = filtered.filter((item) => {
    const description = item.description?.toLowerCase() || "";
    const subType = item.sub_type?.toLowerCase() || "";
    const searchTags = item.search_tags?.toLowerCase() || "";

    return (
      description.includes(selectedType) ||
      subType.includes(selectedType) ||
      searchTags.includes(selectedType)
    );
  });
}

if (filters.maxPrice) {
  filtered = filtered.filter(item => {
    const lunch = Number(item.avg_lunch_pricing);
    const dinner = Number(item.avg_dinner_pricing);

    return lunch <= filters.maxPrice || dinner <= filters.maxPrice;
  });
}

if (filters.minRating) {
  filtered = filtered.filter(item => Number(item.rating) >= filters.minRating);
}

return filtered;
}