import { getPixabayImage } from "./imageApi.js";
import { getReviews } from "./api.js";

export async function renderDetailModal(item) {
  const reviews = await getReviews(item.id);

  console.log(item);

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

  const imageUrl = await getPixabayImage(item.description, item.id);

  content.innerHTML = `
    <main class="stack gap-8">

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
              ${item.price_range || "-"}
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

          <hr>

        <div class="stack width-full gap-4">
          <h2>Information</h2>

          <div class="details">

            <div>
              <span class="text-faded">Kostnad</span>
              <span>${item.price_range} kr</span>
            </div>

            <hr>

            <div>
              <span class="text-faded">Barnrabatt</span>
              <span>${formatBoolean(item.child_discount)}</span>
            </div>

            <hr>

            <div>
              <span class="text-faded">Studentrabatt</span>
              <span>${formatBoolean(item.student_discount)}</span>
            </div>

            <hr>

            <div>
              <span class="text-faded">Seniorrabatt</span>
              <span>${formatBoolean(item.senior_discount)}</span>
            </div>

          </div>
        </div>

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

            ? reviews.map((review) => `

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

            `).join("")

            : `

              <div class="card">

                <p class="text-faded">
                  Inga recensioner ännu.
                </p>

              </div>

            `
        }

      </section>

      </section>

    </main>
  `;
}
