import { createHeader } from "../components/header.js";
import { createEditProfileModal } from "../components/profile-edit-modal.js";
import { getProfile, modifyPassword } from "../api/profile.api.js";
import { getClientById } from "../api/client.api.js";
import { getRelationshipByUser } from "../api/user_client.api.js";
import { showNotification } from "../components/notifications.js";

const headerContainer = document.querySelector("#header-container");
headerContainer.append(createHeader("César", "./profile.html"));

const user = await getProfile();

async function renderUser(user) {
  document.title = `${user.username} - Sprinde`;

  document.querySelector("#user-title").textContent = user.email;

  const clientsList = document.querySelector("#user-list-clients");
  clientsList.replaceChildren();
  let clients = [];
  const relationships = await getRelationshipByUser(user.id);

  for (const r of relationships) {
    const client = await getClientById(r.client_id);
    clients.push(client);
  }

  clients.forEach((client) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");

    link.href = `./client.html?id=${client.id}`;
    link.textContent = client.name;

    listItem.append(link);

    clientsList.append(listItem);
  });

  document.querySelector("#user-email").textContent = user.email;
  document.querySelector("#user-name").textContent = user.username;
  document.querySelector("#user-role").textContent = user.role;
}

renderUser(user);

const editProfileButton = document.querySelector(".button-edit-user");

editProfileButton.addEventListener("click", () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  const modal = createEditProfileModal(user, renderUser);
  document.body.append(modal);
});

const editPasswordButton = document.querySelector(".button-edit-password");

editPasswordButton.onclick = () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }
  const modal = createEditPasswordModal();
  document.body.append(modal);
};

function createEditPasswordModal() {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("edit-password-modal");

  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = "Modificar contraseña";

  const oldPasswordInput = document.createElement("input");
  oldPasswordInput.type = "password";
  oldPasswordInput.name = "oldpassword";
  oldPasswordInput.id = "old-password";
  oldPasswordInput.required = true;

  const newPasswordInput = document.createElement("input");
  newPasswordInput.type = "password";
  newPasswordInput.name = "newpassword";
  newPasswordInput.id = "new-password";
  newPasswordInput.required = true;

  const confirmPasswordInput = document.createElement("input");
  confirmPasswordInput.type = "password";
  confirmPasswordInput.name = "confirmpassword";
  confirmPasswordInput.id = "confirm-password";
  confirmPasswordInput.required = true;

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Cambiar contraseña";
  saveButton.onclick = async () => {
    const oldPassword = oldPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
      return;
    }

    if (oldPassword === newPassword) {
      return;
    }
    if (newPassword !== confirmPassword) {
      return;
    }

    const data = {
      current_password: oldPassword,
      new_password: newPassword,
    };

    try {
      await modifyPassword(data);
      overlay.remove();
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
  };

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

  const closeButton = createCloseButton(overlay);

  modal.append(closeButton);
  modal.append(title);
  modal.append(createField("Contraseña actual", oldPasswordInput));
  modal.append(createField("Contraseña nueva", newPasswordInput));
  modal.append(createField("Confirmar contraseña", confirmPasswordInput));

  modal.append(actions);

  overlay.append(modal);
  return overlay;
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

function createField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("password-edit-field");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.id;

  field.append(label, input);
  return field;
}
