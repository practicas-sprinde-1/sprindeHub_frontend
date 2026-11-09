import { showNotification } from "./notifications.js";

export function createConfirmModal(title, description, onConfirm) {
  const modalElements = createModalElements(title, description);

  registerModalEvents(modalElements, onConfirm);

  return modalElements.overlay;
}

function createModalElements(title, description) {
  const overlay = document.createElement("div");
  overlay.classList.add("confirm-overlay");

  const dialog = document.createElement("section");
  dialog.classList.add("confirm-modal");

  const content = createModalContent(title, description);
  const actions = createModalActions();

  dialog.append(content.title, content.description, actions.container);
  overlay.append(dialog);

  return {
    overlay,
    confirmButton: actions.confirmButton,
    cancelButton: actions.cancelButton,
  };
}

function createModalContent(title, description) {
  const titleElement = document.createElement("h1");
  titleElement.classList.add("modal-title");
  titleElement.textContent = title;

  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = description;

  return { title: titleElement, description: descriptionElement };
}

function createModalActions() {
  const confirmButton = document.createElement("button");
  confirmButton.type = "button";
  confirmButton.classList.add("modal-delete-button");
  confirmButton.textContent = "Borrar";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.textContent = "Cancelar";

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(confirmButton, cancelButton);

  return { container: actions, confirmButton, cancelButton };
}

function registerModalEvents(
  { overlay, confirmButton, cancelButton },
  onConfirm,
) {
  confirmButton.addEventListener("click", () =>
    confirmDeletion({ overlay, confirmButton, onConfirm }),
  );

  cancelButton.addEventListener("click", () => overlay.remove());
}

async function confirmDeletion({ overlay, confirmButton, onConfirm }) {
  try {
    confirmButton.disabled = true;
    await onConfirm();
    showNotification({
      type: "success",
      title: "Eliminado",
      message: "Los datos se han eliminado correctamente.",
    });
    overlay.remove();
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
