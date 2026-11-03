import { showNotification } from "./notifications.js";

export function createConfirmModal(title, description, onConfirm) {
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("confirm-overlay");

  const modal = document.createElement("section");
  modal.classList.add("confirm-modal");

  const titleElement = document.createElement("h1");
  titleElement.classList.add("modal-title");
  titleElement.textContent = title;

  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = description;

  const actions = createModalActions(modalOverlay, onConfirm);

  modal.append(titleElement, descriptionElement, actions);
  modalOverlay.append(modal);
  return modalOverlay;
}

function createModalActions(modalOverlay, onConfirm) {
  const confirmButton = document.createElement("button");
  confirmButton.type = "button";
  confirmButton.classList.add("modal-delete-button");
  confirmButton.textContent = "Borrar";
  confirmButton.addEventListener("click", () =>
    confirmDeletion(modalOverlay, confirmButton, onConfirm),
  );

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", () => modalOverlay.remove());

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(confirmButton, cancelButton);

  return actions;
}

async function confirmDeletion(modalOverlay, confirmButton, onConfirm) {
  try {
    confirmButton.disabled = true;
    await onConfirm();
    showNotification({
      type: "success",
      title: "Eliminado",
      message: "Los datos se han eliminado correctamente.",
    });
    modalOverlay.remove();
  } catch (error) {
    confirmButton.disabled = false;
    showNotification({
      type: "error",
      title: "No se ha podido borrar",
      message: error.message,
      duration: 7000,
    });
  }
}
