const API =
  "https://smapi.lnu.se/api/?debug=true&api_key=v2c0MPUr&controller=establishment&method=getall";

//Kort: Laddar informationen till detaljsidan från api, ändrar windows search till 2, await fetch + json för att ge tid för datan att hämtas
async function loadDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "2";
  const response = await fetch(API);
  const data = await response.json();

  //Hittar rätt plats i datan och ändrar texten på sidan
  const place = data.payload.find((item) => item.id === id);

  // Skriver ut platsens namn i rubriken på detaljsidan.
  document.querySelector("#detail-name").textContent = place.name;
}

loadDetailPage();
