export function createAlertModal(title, description, onConfirm) {
  const overlay = document.createElement("div");
  overlay.classList.add("alert-overlay");

  const modal = document.createElement("section");
  modal.classList.add("alert-modal");

  const titleElement = document.createElement("h1");
  titleElement.textContent = title;
  titleElement.classList.add("modal-title");

  const closeButton = document.createElement("button");
  closeButton.classList.add("modal-close-button");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Cerrar");

  closeButton.addEventListener("click", () => {
    overlay.remove();
  });

  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = description;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Borrar";
  deleteButton.classList.add("modal-delete-button");

  deleteButton.addEventListener("click", async () => {
    // Aquí irá la llamada a la API.
    deleteButton.disabled = true;
    await onConfirm();
    overlay.remove();
  });

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";
  cancelButton.classList.add("modal-cancel-button");

  cancelButton.addEventListener("click", () => {
    overlay.remove();
  });

  const modalActions = document.createElement("div");
  modalActions.classList.add("modal-actions");
  modalActions.append(deleteButton, cancelButton);

  modal.append(closeButton, titleElement, descriptionElement, modalActions);

  overlay.append(modal);

  return overlay;
}
