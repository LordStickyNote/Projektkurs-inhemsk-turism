import { getPixabayImage } from "./imageApi.js";
import { getReviews, getNearbyPlaces } from "./api.js";

export async function renderDetailModal(item) {
  function renderSpecificDetails(item) {
    if (item.type === "food") {
      return renderFoodDetails(item);
    }

    if (item.type === "accommodation") {
      return renderAccommodationDetails(item);
    }

    return renderSeeAndDoDetails(item);
  }

  function renderAccommodationDetails(item) {

    if (item.wifi !== undefined) {
        return `
    <section class="card stack gap-4">

    <div class="stack width-full gap-4">

      <h2>Boendeinformation</h2>

      <div class="details">

        <div>
          <span class="text-faded">Wifi</span>

          <span>
            ${formatBoolean(item.wifi)}
          </span>
        </div>

        <hr>

        <div>
          <span class="text-faded">
            Husdjur tillåtna
          </span>

          <span>
            ${formatBoolean(item.pet_friendly)}
          </span>
        </div>

        <hr>

        <div>
          <span class="text-faded">
            Gratis parkering
          </span>

          <span>
            ${formatBoolean(item.free_parking)}
          </span>
        </div>

      </div>

      </div>

    </section>
  `;
    } else {
        return "";
    }
    
  }

  function renderFoodDetails(item) {

    if (item.vegetarian_option !== undefined) {
        return `
    <section class="card stack gap-4">

    <div class="stack width-full gap-4">

      <h2>Restauranginformation</h2>

      <div class="details">

        <div>
          <span class="text-faded">Vegetariskt</span>

          <span>
            ${formatBoolean(item.vegetarian_option)}
          </span>
        </div>

        <hr>

        <div>
          <span class="text-faded">Uteservering</span>

          <span>
            ${formatBoolean(item.outdoor_seating)}
          </span>
        </div>

        <hr>

        <div>
          <span class="text-faded">Takeaway</span>

          <span>
            ${formatBoolean(item.takeout)}
          </span>
        </div>

        <hr>

        <div>
          <span class="text-faded">Barnmeny</span>

          <span>
            ${formatBoolean(item.child_menu)}
          </span>
        </div>

      </div>

      </div>

    </section>
  `;
    } else {
        return "";
    }
    
  }

  function renderSeeAndDoDetails(item) {
    if (item.child_discount !== undefined) {
        return `
    <section class="card width-full stack gap-4">

    <div class="stack width-full gap-4">

      <h2>Information</h2>

      <div class="details">

        <div>
          <span class="text-faded">
            Barnrabatt
          </span>

          <span>
            ${formatBoolean(item.child_discount)}
          </span>
        </div>

        <hr>

        <div>
          <span class="text-faded">
            Studentrabatt
          </span>

          <span>
            ${formatBoolean(item.student_discount)}
          </span>
        </div>

        <hr>

        <div>
          <span class="text-faded">
            Seniorrabatt
          </span>

          <span>
            ${formatBoolean(item.senior_discount)}
          </span>
        </div>

        <hr>

        <div>
          <span class="text-faded">
            Utomhus
          </span>

          <span>
            ${formatBoolean(item.outdoors)}
          </span>
        </div>

      </div>

      </div>

    </section>
  `;
    } else {
        return "";
    }
    
  }

  const reviews = await getReviews(item.id);
  const nearbyPlaces = await getNearbyPlaces(item.lat, item.lng);

  const imageUrl =
    (await getPixabayImage(item.description, item.id)) ||
    "./img/High_Chaparral_Theme_Park.jpg";

  function formatBoolean(value) {
    if (value === "Y") {
      return "Ja";
    }

    if (value === "N") {
      return "Nej";
    }

    return "-";
  }

  const modal = document.getElementById("detailModal");

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.hidden = true;
    }
  });

  const content = document.getElementById("detailContent");

  modal.hidden = false;

  modal.scrollTop = 0;

  content.innerHTML = `
    <main class="stack gap-8">

    <button
  id="closeDetailBtn"
  class="detail-close-btn"
  aria-label="Stäng">

  ✕

</button>

      <section class="stack gap-8">

        <div class="width-full">
          <img
            src="${imageUrl}"
            alt="${item.name}">
        </div>

        <div class="stack gap-2">

          <div class="row row-between align-center">

            <h1>${item.name}</h1>

            <span
              class="star-container"
              role="img"
              aria-label="${Math.trunc(item.rating || 0)} av 5 stjärnor">

              ${"".repeat(Math.trunc(item.rating || 0))}
            </span>

          </div>

          <div class="row row-between align-center">

            <p class="text-faded">
              ${item.city || "-"} | ${item.description || "-"}
            </p>

            <p class="text-faded">
             Pris: ${item.price_range || "-"} kr
            </p>

          </div>

        </div>

        <hr>

        <section class="card stack">

          <div class="stack width-full gap-2">

            <h2>Beskrivning</h2>

            <div>

              <p>
                ${item.text || "Ingen beskrivning finns."}
              </p>

            </div>

          </div>

        </section>

        <section class="card stack gap-4">

          <div class="width-full stack gap-2">

            <h2>Kontakt</h2>

            <div class="row gap-2">
              <p>
                <strong>Telefon:</strong>
                ${item.phone_number || "Ej tillgängligt"}
              </p>
            </div>

            <div class="row gap-2">

              <p>

                <strong>Webbplats:</strong>

                ${
                  item.website
                    ? `<a href="${item.website}" target="_blank">
                        ${item.website}
                      </a>`
                    : "Ej tillgänglig"
                }

              </p>

            </div>

          </div>

          </section>

          <hr>

        ${renderSpecificDetails(item)}

        </section>

      <section class="stack gap-4">

        <div class="row row-between align-center">

          <div class="row gap-2">

            <h2>Recensioner</h2>

            <p class="text-faded">
              ${reviews.length} st
            </p>

          </div>

          <div class="row gap-1 align-center">

            <p>${Math.trunc(item.rating || 0)}</p>

            <span aria-hidden="true">★</span>

          </div>

        </div>

        ${
          reviews.length > 0
            ? reviews
                .map(
                  (review) => `

              <article class="card">

                <div class="width-full stack gap-3">

                  <div class="stack gap-2">

                    <h3>${review.name}</h3>

                    <p class="text-faded">
                      ${review.comment}
                    </p>

                  </div>

                  <div class="row row-between">

                    <span
                      role="img"
                      aria-label="${review.rating} av 5 stjärnor">

                      ${"★".repeat(Math.trunc(review.rating))}

                    </span>

                    <time class="text-faded">

                      ${review.relative_time || review.timestamp}

                    </time>

                  </div>

                </div>

              </article>

            `,
                )
                .join("")
            : `

              <div class="card">

                <p class="text-faded">
                  Inga recensioner ännu.
                </p>

              </div>

            `
        }

      </section>

      <section class="card stack gap-4">

        <h2>Hitta hit</h2>

        <div id="detailMap"></div>

        </section>

      <hr>

      <section>
          <h2>Platser i närheten</h2>

  <div class="grid gap-6">

    ${nearbyPlaces.length > 0 ?
      nearbyPlaces.slice(0, 4)
      .map(
        (place) => `

          <article class="card card-listing">

          <div class="nearby-cards card card-listing">
            <div class="card-listing-content">

              <h3>${place.name}</h3>

              <p class="text-faded">
                ${place.city}
              </p>

              <div class="gap-2">

                <span class="badge badge-red">
                  ${place.description}
                </span>

              </div>

              <p class="text-faded">
                ${Math.round(place.distance_in_km)} km bort
              </p>

            </div>

          </article>

        `,
      )
      .join("") : `
            <div class="card">

        <p class="text-faded">
          Inga platser i närheten hittades.
        </p>

      </div>
      `}

  </div>
      </section>

      </section>

    </main>
  `;

  document.getElementById("closeDetailBtn").addEventListener("click", () => {
    modal.hidden = true;
  });

  const nearbyCards = content.querySelectorAll(".nearby-cards");

  nearbyCards.forEach(async (card, index) => {
    const place = nearbyPlaces[index];

    const imageUrl = await getPixabayImage(place.description, place.id);

    card.style.backgroundImage = `url('${
      imageUrl || "./img/High_Chaparral_Theme_Park.jpg"
    }')`;

    card.addEventListener("click", () => {
      renderDetailModal(place);
    });
  });
}
