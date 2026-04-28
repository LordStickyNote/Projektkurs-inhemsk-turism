const activityTypeMap = {
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

export function filterActivities(items, filters) {
    let filtered = items;

    if (filters.type) {
        filtered = filtered.filter(item => activityTypeMap[filters.type]?.includes(item.description));
    }

    if (filters.effort) {
        filtered = filtered.filter(item => item.physical_effort === filters.effort);
    }

    if (filters.childFriendly) {
        filtered = filtered.filter(item => item.child_support === "Y");
    }

    if (filters.involvesAnimals) {
        filtered = filtered.filter(item => item.involves_animals === "Y");
    }

    if (filters.involvesWater) {
        filtered = filtered.filter(item => item.involves_water === "Y");
    }

    return filtered;
}