import { PIXAYBAY_API_KEY } from "./config.js";

const imageCache = {};

export const imageQueries = {
  // Activities
  Nöjespark: "amusement park rides",
  Temapark: "theme park family",
  Älgpark: "moose park sweden",
  Djurpark: "zoo family animals",
  Simhall: "indoor swimming pool empty",
  Gokart: "go kart racing track",
  Zipline: "zipline forest adventure",
  Nöjescenter: "family entertainment center",
  Paintballcenter: "paintball outdoor",
  Hälsocenter: "spa wellness center",
  Golfbana: "golf course landscape",
  Lekland: "indoor playground children",
  Bowlinghall: "bowling alley interior",
  Klippklättring: "indoor climbing wall",
  Skateboardpark: "skate park outdoor",
  Nattklubb: "nightclub lights",
  Lekplats: "playground park children",
  Biograf: "cinema movie theater interior",

  // Attractions
  Ateljé: "artist studio interior",
  Fornlämning: "ruins sweden",
  Glasbruk: "glass workshop handmade",
  Hembygdspark: "swedish old house park",
  Konstgalleri: "art gallery exhibition",
  Konsthall: "modern art museum interior",
  Kyrka: "historic church sweden",
  Museum: "museum exhibition interior",
  Myrstack: "forest anthill nature",
  Naturreservat: "forest lake nature reserve sweden",
  Sevärdhet: "tourist attraction sweden",
  Slott: "castle sweden aerial",

  // Accommodation
  Hotell: "hotel room interior",
  Camping: "camping site camper sweden",
  "bed and breakfast": "small guesthouse sweden",
  Stuga: "swedish cabin cottage nature",

  // Food
  hamburgare: "burger fries fast food",
  kebab: "kebab street food",
  korv: "hot dog sausage",
};

export const blockedWords = [
  "bikini",
  "swimsuit",
  "fire",
  "burning",
  "smoke",
  "weapon",
  "war",
  "disaster",
  "forest fire",
];

export async function getPixabayImage(searchTerm, cacheKey) {
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  const query = imageQueries[searchTerm] || searchTerm;

  const url =
    `https://pixabay.com/api/?key=${PIXAYBAY_API_KEY}` +
    `&q=${encodeURIComponent(query)}` +
    `&image_type=photo` +
    `&safesearch=true` +
    `&per_page=6`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    let image = null;

    const safeImages = data.hits.filter((item) => {
      const tags = item.tags.toLowerCase();

      for (const word of blockedWords) {
        if (tags.includes(word)) {
          return false;
        }
      }

      return true;
    });

    if (safeImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * safeImages.length);

      image = safeImages[randomIndex].webformatURL;
    }

    imageCache[cacheKey] = image;

    return image;
  } catch (error) {
    console.error("Fel vid hämtning av Pixabay-bild", error);
    return null;
  }
}
