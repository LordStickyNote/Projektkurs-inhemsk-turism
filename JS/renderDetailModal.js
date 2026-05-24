import { getPixabayImage } from "./imageApi.js";

export async function renderDetailModal(item) {

    const modal = document.getElementById("detailModal");

    const content = document.getElementById("detailContent");

    modal.hidden = false;

    const imageUrl = (await getPixabayImage(item.description, item.id));

    content.innerHTML = `
    <section class="stack gap-6">

      <div
        class="card detail-hero"
        style="background-image: url('${imageUrl}')"
      >
        <div class="card-listing-content">
          <h1>${item.name}</h1>
          <h4>${item.city}</h4>
        </div>
      </div>

      <div class="card stack gap-4">

        <div class="row row-between">
          <h3>${item.description}</h3>

          <span class="row">
            <h4>${Math.trunc(item.rating || 0)}</h4>
          </span>
        </div>

        <hr />

        <div class="details">

          <span>
            <span class="text-faded">Typ</span>
            <span>${item.description || "-"}</span>
          </span>

          <hr />

          <span>
            <span class="text-faded">Kommun</span>
            <span>${item.city || "-"}</span>
          </span>

        </div>

      </div>

    </section>
  `;
}