import { renderCommands } from "../utils/render-commands.js";
import { renderDocumentationLinks } from "../utils/render-documentation-links.js";
import { renderNotes } from "../utils/render-notes.js";

export function createDetailCard(title, items, projectUrl, contentType) {
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

  // Cada tipo de detalle se pinta con su formato propio.
  if (contentType === "commands") {
    renderCommands(list, items);
  } else if (contentType === "links") {
    renderDocumentationLinks(list, items);
  } else if (contentType === "notes") {
    renderNotes(list, items);
  } else {
    items.forEach((itemData) => {
      const item = document.createElement("li");
      item.textContent = itemData;
      list.append(item);
    });
  }

  const detailLink = document.createElement("a");
  detailLink.href = projectUrl;
  detailLink.textContent = "Ver proyecto completo";

  card.append(header, list, detailLink);

  closeButton.addEventListener("click", () => {
    card.remove();
  });

  return card;
}
