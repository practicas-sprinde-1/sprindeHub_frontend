import { renderCommands } from "../utils/render-commands.js";
import { renderDocumentationLinks } from "../utils/render-documentation-links.js";
import { renderNotes } from "../utils/render-notes.js";

export function createDetailCard(title, items, projectUrl, contentType) {
  const card = document.createElement("section");
  card.classList.add("info-card");

  const { header, closeButton } = createCardHeader(title);
  const itemList = createItemList(items, contentType);
  const projectLink = createProjectLink(projectUrl);

  card.append(header, itemList, projectLink);
  closeButton.addEventListener("click", () => card.remove());

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

function createItemList(items, contentType) {
  const itemList = document.createElement("ul");
  itemList.classList.add("info-card-list");

  renderItemsByType(itemList, items, contentType);

  return itemList;
}

function renderItemsByType(itemList, items, contentType) {
  switch (contentType) {
    case "commands":
      renderCommands(itemList, items);
      return;
    case "links":
      renderDocumentationLinks(itemList, items);
      return;
    case "notes":
      renderNotes(itemList, items);
      return;
    default:
      renderTextItems(itemList, items);
  }
}

function renderTextItems(itemList, items) {
  items.forEach((itemText) => {
    const listItem = document.createElement("li");
    listItem.textContent = itemText;
    itemList.append(listItem);
  });
}

function createProjectLink(projectUrl) {
  const projectLink = document.createElement("a");
  projectLink.href = projectUrl;
  projectLink.textContent = "Ver proyecto completo";

  return projectLink;
}
