export function renderSeeAndDo(sections, container) {
    container.innerHTML = "";

    for (const section of sections) {
        const sectionElement = document.createElement("section");
        
        const heading = document.createElement("h2");
        heading.textContent = section.title;

        sectionElement.append(heading)

        for (const item of section.items) {
            const article = document.createElement("article");

            article.innerHTML = `<h3>${item.name}</h3>`;

            sectionElement.append(article)
        }

        container.append(sectionElement)
    }
}