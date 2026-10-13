export function createDetailCard(title, items, projectUrl) {
  const card = document.createElement("section");
  card.classList.add("info-card");

  const header = document.createElement("header");
  header.classList.add("info-card-header");

  const titleElement = document.createElement("h3");
  titleElement.textContent = title;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Cerrar");

  header.append(titleElement, closeButton);

  const list = document.createElement("ul");
  list.classList.add("info-card-list");

  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;

    list.append(item);
  });

  const detailLink = document.createElement("a");
  detailLink.href = projectUrl;
  detailLink.textContent = "Ver proyecto completo";

  card.append(header, list, detailLink);

  closeButton.addEventListener("click", () => {
    card.remove();
  });

  return card;
}
