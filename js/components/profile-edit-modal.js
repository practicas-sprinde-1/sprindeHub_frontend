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

  const usernameInput = createProfileInput("text", "username", user.username);
  const emailInput = createProfileInput("email", "email", user.email);
  const actions = createModalActions(overlay, () =>
    saveProfileChanges(user, renderUser, overlay, usernameInput, emailInput),
  );

  modal.append(closeButton);
  modal.append(title);
  modal.append(createField("Nombre de usuario", usernameInput));
  modal.append(createField("Email", emailInput));
  modal.append(actions);

  overlay.append(modal);
  return overlay;
}

function createProfileInput(type, name, value) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.id = `profile-${name}`;
  input.value = value;
  input.required = true;
  return input;
}

async function saveProfileChanges(user, renderUser, overlay, usernameInput, emailInput) {
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
}

function createModalActions(overlay, onSave) {
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";
  saveButton.addEventListener("click", onSave);

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

  return actions;
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
