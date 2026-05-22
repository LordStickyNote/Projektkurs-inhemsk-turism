import { getPixabayImage } from "./imageApi.js";

export async function renderSeeAndDo(sections, container) {
  const renderedSections = [];

  for (const section of sections) {
    const sectionElement = document.createElement("section");
    sectionElement.classList.add("grid", "width-full", "gap-6");

    const itemsWithImages = await Promise.all(
      section.items.map(async (item) => {
        const imageUrl =
          (await getPixabayImage(item.description, item.id)) ||
          "./img/High_Chaparral_Theme_Park.jpg";

        return {
          ...item,
          imageUrl,
        };
      })
    );

    for (const item of itemsWithImages) {
      const article = document.createElement("article");

      article.innerHTML = `
        <div class="card card-listing" style="background-image: url('${safeAttribute(item.imageUrl)}');">
          <span class="card-listing-content width-full">
            <h3>${safeText(item.name || "Namn saknas")}</h3>

            <h4 class="text-faded">
              ${safeText(item.city || item.municipality || "Ort saknas")}
            </h4>

            <span class="row row-between">
              <span class="gap-2">
                <span class="badge badge-red">
                  ${safeText(item.description || "Beskrivning saknas")}
                </span>
              </span>

              <span class="row">
                <h4>${item.rating ? Math.trunc(item.rating) : "?"}</h4>
                ${getStarSvg("")}
              </span>
            </span>
          </span>
        </div>
      `;

      article.addEventListener("click", () => {
        openDetailDialog(item);
      });

      sectionElement.append(article);
    }

    renderedSections.push(sectionElement);
  }

  container.innerHTML = "";
  container.append(...renderedSections);
}

function openDetailDialog(item) {
  const existingDialog = document.querySelector("#placeDetailDialog");

  if (existingDialog) {
    existingDialog.remove();
  }

  const dialog = document.createElement("dialog");

  dialog.id = "placeDetailDialog";
  dialog.classList.add("card", "stack", "gap-8");

  dialog.innerHTML = `
    <section class="stack gap-8 width-full">
      <form method="dialog" class="justify-right">
        <button class="btn btn-outline btn-sm" type="submit">
          Stäng
        </button>
      </form>

      <div class="width-full">
        <img
          src="${safeAttribute(item.imageUrl || "./img/High_Chaparral_Theme_Park.jpg")}"
          alt="${safeAttribute(item.name || "Bild på plats")}"
          style="width: 100%; max-height: 360px; object-fit: cover; border-radius: var(--radius-lg);"
        />
      </div>

      <div class="gap-2 stack">
        <div class="row row-between align-center">
          <h2>${safeText(item.name || "Namn saknas")}</h2>

          <span class="star-container">
            ${getStars(item.rating)}
          </span>
        </div>

        <div class="row row-between align-center">
          <h4 class="text-faded">
            ${safeText(item.city || item.municipality || "Ort saknas")}
            |
            ${safeText(item.category || item.type || item.description || "Kategori saknas")}
          </h4>

          <h4 class="text-faded">
            ${safeText(item.price_range || item.price || "Pris saknas")}
          </h4>
        </div>
      </div>

      <hr />

      <div class="card stack">
        <div class="stack width-full gap-2">
          <h3>Beskrivning</h3>

          <div class="text-faded">
            <p>
              ${safeText(
                item.text ||
                  item.abstract ||
                  item.description ||
                  "Beskrivning saknas."
              )}
            </p>
          </div>
        </div>
      </div>

      <div class="card stack gap-4">
        <div class="width-full gap-2 stack">
          <h3>Kontakt</h3>

          <span class="row gap-2">
            ${getPhoneSvg()}
            <p>${safeText(item.phone_number || item.phone || "Telefon saknas")}</p>
          </span>

          <span class="row gap-2">
            ${getLinkSvg()}
            ${getWebsiteHtml(item)}
          </span>
        </div>

        <hr />

        <div class="stack width-full gap-4">
          <h3>Information</h3>

          <div class="details">
            <span>
              <span class="text-faded">Kostnad</span>
              <span>${safeText(item.price_range || item.price || "Pris saknas")}</span>
            </span>

            <hr />

            <span>
              <span class="text-faded">Utomhus</span>
              <span>${getBooleanText(item.outdoor)}</span>
            </span>

            <hr />

            <span>
              <span class="text-faded">Barnrabatt</span>
              <span>${getBooleanText(item.child_discount || item.childDiscount)}</span>
            </span>

            <hr />

            <span>
              <span class="text-faded">Studentrabatt</span>
              <span>${getBooleanText(item.student_discount || item.studentDiscount)}</span>
            </span>

            <hr />

            <span>
              <span class="text-faded">Seniorrabatt</span>
              <span>${getBooleanText(item.senior_discount || item.seniorDiscount)}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="card stack">
        <div class="stack width-full gap-2">
          <h3>Väder</h3>

          <div class="text-faded">
            <p>Information om väder</p>
          </div>
        </div>
      </div>

      <div class="stack">
        <div class="stack width-full gap-4">
          <div class="row row-between">
            <span class="row gap-2">
              <h3>Recensioner</h3>
              <h3 class="text-faded">2st</h3>
            </span>

            <span class="row">
              <h4>${item.rating ? Math.trunc(item.rating) : "?"}</h4>
              ${getStarSvg("")}
            </span>
          </div>

          <div class="card">
            <div class="width-full stack gap-3">
              <span class="stack gap-2">
                <h3>Anna Persson</h3>
                <p class="text-faded">Hela familjen hade en toppendag!</p>
              </span>

              <div class="row row-between">
                <span class="star-container">
                  ${getStars(3, "star-sm")}
                </span>

                <h5 class="text-faded">30 January 2018</h5>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="width-full stack gap-3">
              <span class="stack gap-2">
                <h3>Ulla-Britt Johansson</h3>
                <p class="text-faded">
                  Helt okej besök, men kunde varit bättre organiserat.
                </p>
              </span>

              <div class="row row-between">
                <span class="star-container">
                  ${getStars(2, "star-sm")}
                </span>

                <h5 class="text-faded">30 January 2018</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div class="stack gap-4">
        <h2>Platser i närheten</h2>

        <div class="grid gap-4">
          ${getNearbyPlacesHtml(item)}
        </div>
      </div>
    </section>
  `;

  document.body.append(dialog);

  dialog.showModal();

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
      dialog.remove();
    }
  });

  dialog.addEventListener("close", () => {
    dialog.remove();
  });
}

function getNearbyPlacesHtml(item) {
  return `
    <article class="card">
      <img
        src="${safeAttribute(item.imageUrl || "./img/High_Chaparral_Theme_Park.jpg")}"
        alt="${safeAttribute(item.name || "Bild på plats")}"
        style="width: 100%; height: 140px; object-fit: cover; border-radius: var(--radius-lg);"
      />

      <h3>${safeText(item.name || "Namn saknas")}</h3>

      <h4 class="text-faded">
        ${safeText(item.city || item.municipality || "Ort saknas")}
      </h4>

      <p>${safeText(item.category || item.type || item.description || "Kategori saknas")}</p>
    </article>

    <article class="card">
      <img
        src="${safeAttribute(item.imageUrl || "./img/High_Chaparral_Theme_Park.jpg")}"
        alt="${safeAttribute(item.name || "Bild på plats")}"
        style="width: 100%; height: 140px; object-fit: cover; border-radius: var(--radius-lg);"
      />

      <h3>${safeText(item.name || "Namn saknas")}</h3>

      <h4 class="text-faded">
        ${safeText(item.city || item.municipality || "Ort saknas")}
      </h4>

      <p>${safeText(item.category || item.type || item.description || "Kategori saknas")}</p>
    </article>
  `;
}

function getWebsiteHtml(item) {
  if (!item.website) {
    return `<p class="text-faded">Webbplats saknas</p>`;
  }

  return `
    <a href="${safeAttribute(item.website)}" target="_blank">
      ${safeText(item.website)}
    </a>
  `;
}

function getBooleanText(value) {
  if (value === true || value === "true" || value === "Ja" || value === "ja") {
    return "Ja";
  }

  if (
    value === false ||
    value === "false" ||
    value === "Nej" ||
    value === "nej"
  ) {
    return "Nej";
  }

  return "Information saknas";
}

function getStars(rating, extraClass = "") {
  const numberOfStars = rating ? Math.trunc(Number(rating)) : 0;
  let stars = "";

  for (let i = 0; i < numberOfStars; i++) {
    stars += getStarSvg(extraClass);
  }

  if (stars === "") {
    stars = getStarSvg(extraClass);
  }

  return stars;
}

function getStarSvg(extraClass) {
  return `
    <svg class="star ${extraClass}" viewBox="0 0 16 16">
      <path
        d="M7.71954 0.445459C7.86922 -0.0151958 8.52092 -0.0151964 8.6706 0.445459L9.76667 3.81881C9.8336 4.02483 10.0256 4.16431 10.2422 4.16431H13.7892C14.2735 4.16431 14.4749 4.78411 14.083 5.06881L11.2135 7.15366C11.0383 7.28098 10.9649 7.50667 11.0319 7.71268L12.1279 11.086C12.2776 11.5467 11.7504 11.9298 11.3585 11.6451L8.48896 9.5602C8.31372 9.43288 8.07642 9.43288 7.90118 9.5602L5.03163 11.6451C4.63977 11.9298 4.11253 11.5467 4.26221 11.086L5.35828 7.71268C5.42521 7.50667 5.35188 7.28098 5.17664 7.15366L2.30709 5.06881C1.91524 4.78411 2.11662 4.16431 2.60099 4.16431H6.14794C6.36455 4.16431 6.55653 4.02483 6.62347 3.81881L7.71954 0.445459Z"
      ></path>
    </svg>
  `;
}

function getPhoneSvg() {
  return `
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.82 16z"
      ></path>
    </svg>
  `;
}

function getLinkSvg() {
  return `
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
      ></path>
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      ></path>
    </svg>
  `;
}

function safeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}