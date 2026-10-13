export function renderNotes(list, notes) {
  notes.forEach((note) => {
    const listItem = document.createElement("li");
    const description = document.createElement("strong");
    const content = document.createElement("p");

    listItem.classList.add("detail-list-item");
    description.classList.add("detail-list-title");
    content.classList.add("detail-list-content");

    description.textContent = note.description;
    content.textContent = note.content;

    listItem.append(description, content);
    list.append(listItem);
  });
}
