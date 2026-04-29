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

const attractionTypeMap = {
    history: ["HISTORY"],
    art: ["ART", "SOCIAL"],
    nature: ["NATURE & SCIENCE"],
    landmark: ["HISTORY"]
};

export function filterAttractions(items, filters) {
    let filtered = items;

    if (filters.type) {
        filtered = filtered.filter(item => attractionTypeMap[filters.type]?.includes(item.category))
    }

    if (filters.experience === "interactive") {
        filtered = filtered.filter(item => item.interactive === "Y");
    }

    if (filters.experience === "static") {
        filtered = filtered.filter(item => item.static_content === "Y");
    }

    if (filters.childFriendly) {
        filtered = filtered.filter(item => item.child_friendly === "Y");
    }

    if (filters.localSignificance) {
        filtered = filtered.filter(item => item.significance === "LOCAL")
    }

    return filtered;
}