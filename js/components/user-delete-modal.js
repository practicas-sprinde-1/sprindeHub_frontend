import { deleteUser } from "../api/user.api.js";

export function createDeleteUserModal(user, showUsers) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("user-modal");

  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = `Borrar usuario: ${user.username}`;

  const closeButton = createCloseButton(overlay);

  const description = document.createElement("p");
  description.textContent = "Esta acción eliminará este usuario.";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("modal-delete-button");
  deleteButton.textContent = "Borrar";
  deleteButton.addEventListener("click", async () => {
    await deleteUser(user.id);
    showUsers();
    overlay.remove();
  });

  const cancelButton = createCancelButton(overlay);

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(deleteButton, cancelButton);

  modal.append(closeButton);
  modal.append(title);
  modal.append(description);
  modal.append(actions);

  overlay.append(modal);
  return overlay;
}

function createCloseButton(overlay) {
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("modal-close-button");
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Cerrar");
  closeButton.addEventListener("click", () => {
    overlay.remove();
  });
  return closeButton;
}

function createCancelButton(overlay) {
  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", () => {
    overlay.remove();
  });
  return cancelButton;
}
