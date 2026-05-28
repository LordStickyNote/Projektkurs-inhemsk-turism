import { getPixabayImage } from "./imageApi.js";
import { getReviews, getNearbyPlaces } from "./api.js";
import { renderDetailMap } from "./map.js";
import { isFavorite, toggleFavorite } from "./favorites.js";
import { updateFavoritesCount, reloadCurrentCategory } from "./main.js";

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

        <span>
          <span class="text-faded">Wifi</span>

<span${
        formatBoolean(item.wifi) === "Nej" ? ' class="text-faded"' : ""
      }>             ${formatBoolean(item.wifi)}
          </span>
        </span>

        <hr>

        <span>
          <span class="text-faded">
            Husdjur tillåtna
          </span>

<span${
        formatBoolean(item.pet_friendly) === "Nej" ? ' class="text-faded"' : ""
      }>             ${formatBoolean(item.pet_friendly)}
          </span>
        </span>

        <hr>

        <span>
          <span class="text-faded">
            Gratis parkering
          </span>

<span${
        formatBoolean(item.free_parking) === "Nej" ? ' class="text-faded"' : ""
      }>             ${formatBoolean(item.free_parking)}
          </span>
        </span>

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

        <span>
          <span class="text-faded">Vegetariskt</span>

<span${
        formatBoolean(item.vegetarian_option) === "Nej"
          ? ' class="text-faded"'
          : ""
      }>             ${formatBoolean(item.vegetarian_option)}
          </span>
        </span>

        <hr>

        <span>
          <span class="text-faded">Uteservering</span>

          <span${
            formatBoolean(item.outdoor_seating) === "Nej"
              ? ' class="text-faded"'
              : ""
          }> 
            ${formatBoolean(item.outdoor_seating)}
          </span>
        </span>

        <hr>

        <span>
          <span class="text-faded">Takeaway</span>

          <span${
            formatBoolean(item.takeout) === "Nej" ? ' class="text-faded"' : ""
          }> 
            ${formatBoolean(item.takeout)}
          </span>
        </span>

        <hr>

        <span>
          <span class="text-faded">Barnmeny</span>

<span${
        formatBoolean(item.child_menu) === "Nej" ? ' class="text-faded"' : ""
      }>             ${formatBoolean(item.child_menu)}
          </span>
        </span>

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

        <span>

        
        
          <span class="text-faded">
            Barnrabatt
          </span>

<span${
        formatBoolean(item.child_discount) === "Nej"
          ? ' class="text-faded"'
          : ""
      }>            ${formatBoolean(item.child_discount)}
          </span>
        </span>

        <hr>

        <span>
          <span class="text-faded">
            Studentrabatt
          </span>

<span${
        formatBoolean(item.student_discount) === "Nej"
          ? ' class="text-faded"'
          : ""
      }>            ${formatBoolean(item.student_discount)}
          </span>
        </span>

        <hr>

        <span>
          <span class="text-faded">
            Seniorrabatt
          </span>

          <span${
            formatBoolean(item.senior_discount) === "Nej"
              ? ' class="text-faded"'
              : ""
          }>
            ${formatBoolean(item.senior_discount)}
          </span>
        </span>

        <hr>

        <span>
          <span class="text-faded">
            Utomhus
          </span>

<span${
        formatBoolean(item.outdoors) === "Nej" ? ' class="text-faded"' : ""
      }>             ${formatBoolean(item.outdoors)}
          </span>
        </span>

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

  const filteredNearbyPlaces = nearbyPlaces.filter((place) => {
    return String(place.id) !== String(item.id);
  });

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

      <section class="stack gap-6">

        <div class="width-full">
          <img
            src="${imageUrl}"
            alt="${item.name}">
        </div>

        <div class="stack gap-2">

            <div class="row-between row align-start">
              <h2>${item.name}</h2>
                                        <button class="favorite-btn-detail">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 99.37 88.44">
                <path
                  d="M49.65,88.44L10.93,49.71C-19.25,19.53,19.48-19.19,49.65,10.99c30.28-30.28,69.01,8.44,38.72,38.72l-38.72,38.72Z"
                />
              </svg>
            </button>

            </div>

            <div class="row row-between align-center">
              <span class="star-container">
              ${`<svg class='star' viewBox='0 0 16 16'>
              <path
                d='M7.71954 0.445459C7.86922 -0.0151958 8.52092 -0.0151964 8.6706 0.445459L9.76667 3.81881C9.8336 4.02483 10.0256 4.16431 10.2422 4.16431H13.7892C14.2735 4.16431 14.4749 4.78411 14.083 5.06881L11.2135 7.15366C11.0383 7.28098 10.9649 7.50667 11.0319 7.71268L12.1279 11.086C12.2776 11.5467 11.7504 11.9298 11.3585 11.6451L8.48896 9.5602C8.31372 9.43288 8.07642 9.43288 7.90118 9.5602L5.03163 11.6451C4.63977 11.9298 4.11253 11.5467 4.26221 11.086L5.35828 7.71268C5.42521 7.50667 5.35188 7.28098 5.17664 7.15366L2.30709 5.06881C1.91524 4.78411 2.11662 4.16431 2.60099 4.16431H6.14794C6.36455 4.16431 6.55653 4.02483 6.62347 3.81881L7.71954 0.445459Z'
              ></path></svg
            >`.repeat(Math.trunc(item.rating))}
              </span>

                          <p class="text-faded">
             Pris: ${item.price_range || "-"} kr
            </p>

            </div>

                        <p class="text-faded">
              ${item.city || "-"} | ${item.description || "-"}
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
<hr>
            <div class="row gap-2">
              <p>
                <strong>Address:</strong>
                ${item.address || "Ej tillgängligt"}
              </p>
            </div>
            <div class="row gap-2">
              <p>
                <strong>Ort:</strong>
                ${item.city || "Ej tillgängligt"}
              </p>
            </div>

          </div>

          </section>

          <hr>

        ${renderSpecificDetails(item)}

        </section>

        <hr>

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

            <span aria-hidden="true"><svg class='star' viewBox='0 0 16 16'>
              <path
                d='M7.71954 0.445459C7.86922 -0.0151958 8.52092 -0.0151964 8.6706 0.445459L9.76667 3.81881C9.8336 4.02483 10.0256 4.16431 10.2422 4.16431H13.7892C14.2735 4.16431 14.4749 4.78411 14.083 5.06881L11.2135 7.15366C11.0383 7.28098 10.9649 7.50667 11.0319 7.71268L12.1279 11.086C12.2776 11.5467 11.7504 11.9298 11.3585 11.6451L8.48896 9.5602C8.31372 9.43288 8.07642 9.43288 7.90118 9.5602L5.03163 11.6451C4.63977 11.9298 4.11253 11.5467 4.26221 11.086L5.35828 7.71268C5.42521 7.50667 5.35188 7.28098 5.17664 7.15366L2.30709 5.06881C1.91524 4.78411 2.11662 4.16431 2.60099 4.16431H6.14794C6.36455 4.16431 6.55653 4.02483 6.62347 3.81881L7.71954 0.445459Z'
              ></path></svg
            ></span>

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

                    <span class="star-container"
                      role="img"
                      aria-label="${review.rating} av 5 stjärnor">

                      ${`<svg class='star star-sm' viewBox='0 0 16 16'>
              <path
                d='M7.71954 0.445459C7.86922 -0.0151958 8.52092 -0.0151964 8.6706 0.445459L9.76667 3.81881C9.8336 4.02483 10.0256 4.16431 10.2422 4.16431H13.7892C14.2735 4.16431 14.4749 4.78411 14.083 5.06881L11.2135 7.15366C11.0383 7.28098 10.9649 7.50667 11.0319 7.71268L12.1279 11.086C12.2776 11.5467 11.7504 11.9298 11.3585 11.6451L8.48896 9.5602C8.31372 9.43288 8.07642 9.43288 7.90118 9.5602L5.03163 11.6451C4.63977 11.9298 4.11253 11.5467 4.26221 11.086L5.35828 7.71268C5.42521 7.50667 5.35188 7.28098 5.17664 7.15366L2.30709 5.06881C1.91524 4.78411 2.11662 4.16431 2.60099 4.16431H6.14794C6.36455 4.16431 6.55653 4.02483 6.62347 3.81881L7.71954 0.445459Z'
              ></path></svg
            >`.repeat(Math.trunc(review.rating))}

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

      <hr>

      <section class="card stack gap-4">

        <div class="width-full stack gap-4">

        <h2>Hitta hit</h2>

        <div id="detailMap"></div>

        </div>

        </section>

      <hr>

      <section class="stack gap-4">
          <h2>Platser i närheten</h2>

  <div class="grid gap-6">

    ${
      filteredNearbyPlaces.length > 0
        ? filteredNearbyPlaces
            .slice(0, 4)
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
            .join("")
        : `
            <div class="card">

        <p class="text-faded">
          Inga platser i närheten hittades.
        </p>

      </div>
      `
    }

  </div>
      </section>

      </section>

    </main>
  `;

  const favoriteBtn = modal.querySelector(".favorite-btn-detail");

  const favoriteActive = isFavorite(item.id);

  if (favoriteActive) {
    favoriteBtn.classList.add("active");
  }

  favoriteBtn.addEventListener("click", () => {
    const active = toggleFavorite(item);

    favoriteBtn.classList.toggle("active", active);

    updateFavoritesCount();

    reloadCurrentCategory();
  });

  setTimeout(() => {
    renderDetailMap(item.lat, item.lng);
  }, 0);

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
