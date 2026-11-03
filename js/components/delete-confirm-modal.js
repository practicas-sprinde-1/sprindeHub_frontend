import { showNotification } from "./notifications.js";

export function createConfirmModal(title, description, onConfirm) {
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("confirm-overlay");

  const modal = document.createElement("section");
  modal.classList.add("confirm-modal");

  const { titleElement, descriptionElement } = createModalContent(title, description);
  const { actionsContainer, deleteButton, cancelButton } = createModalActions();

  deleteButton.addEventListener("click", () =>
    handleDeletionConfirmation(modalOverlay, deleteButton, onConfirm),
  );
  cancelButton.addEventListener("click", () => modalOverlay.remove());

  modal.append(titleElement, descriptionElement, actionsContainer);
  modalOverlay.append(modal);
  return modalOverlay;
}

function createModalContent(title, description) {
  const titleElement = document.createElement("h1");
  titleElement.classList.add("modal-title");
  titleElement.textContent = title;

  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = description;

  return { titleElement, descriptionElement };
}

function createModalActions() {
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("modal-delete-button");
  deleteButton.textContent = "Borrar";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.textContent = "Cancelar";

  const actionsContainer = document.createElement("div");
  actionsContainer.classList.add("modal-actions");
  actionsContainer.append(deleteButton, cancelButton);

  return { actionsContainer, deleteButton, cancelButton };
}

async function handleDeletionConfirmation(modalOverlay, deleteButton, onConfirm) {
  try {
    deleteButton.disabled = true;
    await onConfirm();
    showNotification({
      type: "success",
      title: "Eliminado",
      message: "Los datos se han eliminado correctamente.",
    });
    modalOverlay.remove();
  } catch (error) {
    deleteButton.disabled = false;
    showNotification({
      type: "error",
      title: "No se ha podido borrar",
      message: error.message,
      duration: 7000,
    });
  }
}
