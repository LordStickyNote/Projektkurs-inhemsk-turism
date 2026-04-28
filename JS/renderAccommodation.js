export function renderAccommodation(items, container) {
    container.innerHTML = "";

    for (const item of items) {
        const article = document.createElement("article");

        article.innerHTML = `
        <h2>${item.name}</h2>
        `

        container.append(article)
    }
}