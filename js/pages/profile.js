import { getClientById } from "../api/client.api.js";
import { getProfile, modifyPassword } from "../api/profile.api.js";
import { getRelationshipByUser } from "../api/user_client.api.js";
import { createHeader } from "../components/header.js";
import { showNotification } from "../components/notifications.js";
import { createEditProfileModal } from "../features/profile-edit-modal.js";

const MIN_PASSWORD_LENGTH = 10;

const currentUser = await getProfile();

renderHeader(currentUser);
renderUser(currentUser);
registerProfileActions(currentUser);

function renderHeader(user) {
  const headerContainer = document.querySelector("#header-container");
  headerContainer.append(createHeader(user.username, "./profile.html"));

  document.title = `${user.username} - Sprinde`;
  document.querySelector("#user-title").textContent = user.email;
}

async function renderUser(user) {
  const clientsList = document.querySelector("#user-list-clients");
  clientsList.replaceChildren();

  const clients = await getClientsForUser(user.id);
  renderClients(clientsList, clients);
  renderUserDetails(user);
}

async function getClientsForUser(userId) {
  const relationships = await getRelationshipByUser(userId);
  const clients = [];

  for (const relationship of relationships) {
    const client = await getClientById(relationship.client_id);
    clients.push(client);
  }

  return clients;
}

function renderClients(clientsList, clients) {
  for (const client of clients) {
    const listItem = document.createElement("li");
    const link = document.createElement("a");

    link.href = `./client.html?id=${client.id}`;
    link.textContent = client.name;
    listItem.append(link);
    clientsList.append(listItem);
  }
}

function renderUserDetails(user) {
  document.querySelector("#user-email").textContent = user.email;
  document.querySelector("#user-name").textContent = user.username;
  document.querySelector("#user-role").textContent = user.role;
}

function registerProfileActions(user) {
  const editProfileButton = document.querySelector(".button-edit-user");
  const editPasswordButton = document.querySelector(".button-edit-password");

  editProfileButton.addEventListener("click", () => {
    openModal(() => createEditProfileModal(user, renderUser));
  });

  editPasswordButton.addEventListener("click", () => {
    openModal(createEditPasswordModal);
  });
}

function openModal(createModal) {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  document.body.append(createModal());
}

function createEditPasswordModal() {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const passwordInputs = createPasswordInputs();
  const closeModal = () => overlay.remove();
  const savePassword = () => changePassword(passwordInputs, closeModal);
  const modal = createPasswordModalContent(
    passwordInputs,
    closeModal,
    savePassword,
  );

  overlay.append(modal);
  return overlay;
}

function createPasswordInputs() {
  return {
    currentPassword: createPasswordInput("oldpassword", "old-password"),
    newPassword: createPasswordInput("newpassword", "new-password"),
    passwordConfirmation: createPasswordInput(
      "confirmpassword",
      "confirm-password",
    ),
  };
}

function createPasswordInput(name, id) {
  const input = document.createElement("input");
  input.type = "password";
  input.name = name;
  input.id = id;
  input.required = true;
  return input;
}

function createPasswordModalContent(inputs, closeModal, savePassword) {
  const modal = document.createElement("section");
  modal.classList.add("edit-password-modal");

  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = "Modificar contraseña";

  modal.append(
    createCloseButton(closeModal),
    title,
    createField("Contraseña actual", inputs.currentPassword),
    createField("Contraseña nueva", inputs.newPassword),
    createField("Confirmar contraseña", inputs.passwordConfirmation),
    createModalActions(closeModal, savePassword),
  );

  return modal;
}

async function changePassword(inputs, closeModal) {
  const passwordChange = readPasswordChange(inputs);

  if (!isValidPasswordChange(passwordChange, inputs)) {
    return;
  }

  const passwordData = {
    current_password: passwordChange.currentPassword,
    new_password: passwordChange.newPassword,
  };

  try {
    await modifyPassword(passwordData);
    closeModal();
    showNotification({
      type: "success",
      title: "Contraseña modificada",
      message: "La contraseña se ha actualizado correctamente.",
    });
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se ha podido modificar la contraseña",
      message: error.message,
      duration: 7000,
    });
  }
}

function readPasswordChange(inputs) {
  return {
    currentPassword: inputs.currentPassword.value.trim(),
    newPassword: inputs.newPassword.value.trim(),
    passwordConfirmation: inputs.passwordConfirmation.value.trim(),
  };
}

function isValidPasswordChange(passwordChange, inputs) {
  if (
    passwordChange.currentPassword === "" ||
    passwordChange.newPassword === "" ||
    passwordChange.passwordConfirmation === ""
  ) {
    showNotification({
      type: "warning",
      title: "Campos obligatorios",
      message: "Completa todos los campos de contraseña.",
    });

    for (const inputName in passwordChange) {
      const inputValue = passwordChange[inputName];

      if (inputValue === "") {
        inputs[inputName].focus();
        return false;
      }
    }
  }

  if (passwordChange.newPassword.length < MIN_PASSWORD_LENGTH) {
    showNotification({
      type: "error",
      title: "Contraseña demasiado corta",
      message: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    });
    inputs.newPassword.focus();
    return false;
  }

  if (passwordChange.currentPassword === passwordChange.newPassword) {
    showNotification({
      type: "error",
      title: "Contraseña no válida",
      message: "La nueva contraseña debe ser distinta de la contraseña actual.",
    });
    inputs.newPassword.focus();
    return false;
  }

  if (passwordChange.newPassword !== passwordChange.passwordConfirmation) {
    showNotification({
      type: "error",
      title: "Las contraseñas no coinciden",
      message: "La confirmación debe coincidir con la nueva contraseña.",
    });
    inputs.passwordConfirmation.focus();
    return false;
  }

  return true;
}

function createModalActions(closeModal, savePassword) {
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Cambiar contraseña";
  saveButton.addEventListener("click", savePassword);

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

function createCloseButton(closeModal) {
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("modal-close-button");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", closeModal);
  return closeButton;
}

function createField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("password-edit-field");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.id;

  field.append(label, input);
  return field;
}
