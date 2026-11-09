import { modifyProfile } from "../api/profile.api.js";
import { showNotification } from "./notifications.js";

export function createEditProfileModal(user, renderUser) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const inputs = createProfileInputs(user);
  const closeModal = () => overlay.remove();
  const saveChanges = () =>
    saveProfileChanges(user, renderUser, overlay, inputs);

  const modal = createModalContent(inputs, closeModal, saveChanges);

  overlay.append(modal);
  return overlay;
}

function createProfileInputs(user) {
  return {
    username: createProfileInput("text", "username", user.username),
    email: createProfileInput("email", "email", user.email),
  };
}

function createModalContent(inputs, closeModal, saveChanges) {
  const modal = document.createElement("section");
  modal.classList.add("edit-profile-modal");

  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = "Modificar datos";

  modal.append(
    createCloseButton(closeModal),
    title,
    createField("Nombre de usuario", inputs.username),
    createField("Email", inputs.email),
    createModalActions(closeModal, saveChanges),
  );

  return modal;
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

async function saveProfileChanges(user, renderUser, overlay, inputs) {
  const profileChanges = readProfileChanges(inputs);

  if (!hasRequiredProfileData(profileChanges)) {
    return;
  }

  user.username = profileChanges.username;
  user.email = profileChanges.email;

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

function readProfileChanges(inputs) {
  return {
    username: inputs.username.value.trim(),
    email: inputs.email.value.trim(),
  };
}

function hasRequiredProfileData({ username, email }) {
  return username !== "" && email !== "";
}

function createModalActions(closeModal, saveChanges) {
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";
  saveButton.addEventListener("click", saveChanges);

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", closeModal);

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

function createCloseButton(closeModal) {
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("modal-close-button");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", closeModal);
  return closeButton;
}
