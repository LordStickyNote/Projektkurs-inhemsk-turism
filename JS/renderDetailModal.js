import { getPixabayImage } from "./imageApi.js";

export async function renderDetailModal(item) {

    const modal = document.getElementById("detailModal");

    const content = document.getElementById("detailContent");

    modal.hidden = false;

    const imageUrl = (await getPixabayImage(item.description, item.id));
}