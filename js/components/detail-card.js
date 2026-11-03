import { renderCommands } from "../utils/render-commands.js";
import { renderDocumentationLinks } from "../utils/render-documentation-links.js";
import { renderNotes } from "../utils/render-notes.js";

export function createDetailCard(title, items, projectUrl, contentType) {
  const card = document.createElement("section");
  card.classList.add("info-card");

  const { header, closeButton } = createCardHeader(title);
  const list = document.createElement("ul");
  list.classList.add("info-card-list");
  renderDetailItems(list, items, contentType);

  const projectLink = document.createElement("a");
  projectLink.href = projectUrl;
  projectLink.textContent = "Ver proyecto completo";

  card.append(header, list, projectLink);

  closeButton.addEventListener("click", () => {
    card.remove();
  });

  return card;
}

function createCardHeader(title) {
  const header = document.createElement("header");
  header.classList.add("info-card-header");

  const titleElement = document.createElement("h3");
  titleElement.textContent = title;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "×";

  header.append(titleElement, closeButton);

  return { header, closeButton };
}

function renderDetailItems(list, items, contentType) {
  if (contentType === "commands") {
    renderCommands(list, items);
    return;
  }

  if (contentType === "links") {
    renderDocumentationLinks(list, items);
    return;
  }

  if (contentType === "notes") {
    renderNotes(list, items);
    return;
  }

  items.forEach((itemText) => {
    const listItem = document.createElement("li");
    listItem.textContent = itemText;
    list.append(listItem);
  });
}
