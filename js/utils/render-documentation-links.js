export function renderDocumentationLinks(list, links) {
  links.forEach((documentationLink) => {
    const listItem = document.createElement("li");
    const title = document.createElement("strong");
    const link = document.createElement("a");

    listItem.classList.add("detail-list-item");
    title.classList.add("detail-list-title");
    link.classList.add("detail-list-link");

    title.textContent = documentationLink.title;
    link.href = documentationLink.url;
    link.textContent = documentationLink.url;
    link.target = "_blank";
    link.rel = "noreferrer";

    listItem.append(title, link);
    list.append(listItem);
  });
}
