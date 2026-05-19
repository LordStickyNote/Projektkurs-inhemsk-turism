import { getPixabayImage } from "./imageApi.js";

export async function renderFood(items, container) {
  container.innerHTML = "";

  const sectionElement = document.createElement("section");
  sectionElement.classList.add("grid", "width-full", "gap-6");

  for (const item of items) {
    const article = document.createElement("article");

    const imageUrl = (await getPixabayImage(item.search_tags, item.id)) || "./img/High_Chaparral_Theme_Park.jpg";

    article.innerHTML = `
            <div class="card card-listing">
        <img src="${imageUrl}" loading="lazy" alt="Image of ${item.description}" />
        <span class="card-listing-content width-full">
          <h3>${item.name}</h3>
          <h4 class="text-faded">${item.city}</h4>
          <span class="row row-between">
              <span class="gap-2">
                <span class="badge badge-red">${item.description}</span>
              </span>
              <span class="row">
              <h4>${Math.trunc(item.rating)}</h4><svg class="star" viewBox="0 0 16 16">
              <path
                d="M7.71954 0.445459C7.86922 -0.0151958 8.52092 -0.0151964 8.6706 0.445459L9.76667 3.81881C9.8336 4.02483 10.0256 4.16431 10.2422 4.16431H13.7892C14.2735 4.16431 14.4749 4.78411 14.083 5.06881L11.2135 7.15366C11.0383 7.28098 10.9649 7.50667 11.0319 7.71268L12.1279 11.086C12.2776 11.5467 11.7504 11.9298 11.3585 11.6451L8.48896 9.5602C8.31372 9.43288 8.07642 9.43288 7.90118 9.5602L5.03163 11.6451C4.63977 11.9298 4.11253 11.5467 4.26221 11.086L5.35828 7.71268C5.42521 7.50667 5.35188 7.28098 5.17664 7.15366L2.30709 5.06881C1.91524 4.78411 2.11662 4.16431 2.60099 4.16431H6.14794C6.36455 4.16431 6.55653 4.02483 6.62347 3.81881L7.71954 0.445459Z"
              ></path></svg
            >
              </span>
          </span>
        </span>
      </div>
            `;

    sectionElement.append(article);
  }
  container.append(sectionElement);
}