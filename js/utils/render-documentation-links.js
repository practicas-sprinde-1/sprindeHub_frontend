function createDocumentationListItem(documentationLink) {
  const listItem = document.createElement("li");
  const titleElement = document.createElement("strong");
  const linkElement = document.createElement("a");

  listItem.classList.add("detail-list-item");
  titleElement.classList.add("detail-list-title");
  linkElement.classList.add("detail-list-link");

  titleElement.textContent = documentationLink.title;
  linkElement.href = documentationLink.url;
  linkElement.textContent = documentationLink.url;
  linkElement.target = "_blank";
  linkElement.rel = "noreferrer";

  listItem.append(titleElement, linkElement);

  return listItem;
}

export function renderDocumentationLinks(documentationList, documentationLinks) {
  documentationLinks.forEach((documentationLink) => {
    const listItem = createDocumentationListItem(documentationLink);

    documentationList.append(listItem);
  });
}
