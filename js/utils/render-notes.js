export function renderNotes(notesList, notes) {
  notes.forEach((note) => {
    notesList.append(createNoteListItem(note));
  });
}

function createNoteListItem(note) {
  const listItem = document.createElement("li");
  const descriptionElement = document.createElement("strong");
  const contentElement = document.createElement("p");

  listItem.classList.add("detail-list-item");
  descriptionElement.classList.add("detail-list-title");
  contentElement.classList.add("detail-list-content");

  descriptionElement.textContent = note.description;
  contentElement.textContent = note.content;

  listItem.append(descriptionElement, contentElement);

  return listItem;
}
