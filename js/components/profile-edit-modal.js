import { modifyProfile } from "../api/profile.api.js";
import { showNotification } from "./notifications.js";

export function createEditProfileModal(user, renderUser) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("edit-profile-modal");

  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = "Modificar datos";

  const closeButton = createCloseButton(overlay);

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.name = "username";
  usernameInput.id = "profile-username";
  usernameInput.value = user.username;
  usernameInput.required = true;

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.name = "email";
  emailInput.id = "profile-email";
  emailInput.value = user.email;
  emailInput.required = true;

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";
  saveButton.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (username === "" || email === "") {
      return;
    }

    user.username = username;
    user.email = email;

    try {
      await modifyProfile(user);
      await renderUser(user);
      overlay.remove();
      showNotification({
        type: "success",
        title: "Perfil modificado",
        message: "Los datos se han guardado correctamente.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "No se ha podido modificar el perfil",
        message: error.message,
        duration: 7000,
      });
    }
  });

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", () => {
    overlay.remove();
  });

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(saveButton, cancelButton);

  modal.append(closeButton);
  modal.append(title);
  modal.append(createField("Nombre de usuario", usernameInput));
  modal.append(createField("Email", emailInput));
  modal.append(actions);

  overlay.append(modal);
  return overlay;
}

function createField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("profile-edit-field");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.id;

  field.append(label, input);
  return field;
}

function createCloseButton(overlay) {
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("modal-close-button");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", () => {
    overlay.remove();
  });
  return closeButton;
}
