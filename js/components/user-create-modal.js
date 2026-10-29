import { setUser } from "../api/user.api.js";
import { showNotification } from "./notifications.js";

export function createNewUserModal(showUsers) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("user-modal");

  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = "Crear usuario";

  const closeButton = createCloseButton(overlay);

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.name = "email";
  emailInput.id = "new-user-email";
  emailInput.required = true;

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.name = "username";
  usernameInput.id = "new-user-username";
  usernameInput.required = true;

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.name = "password";
  passwordInput.id = "new-user-password";
  passwordInput.required = true;

  const roleSelect = createRoleSelect("new-user-role");

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";
  saveButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (email === "" || username === "" || password === "") {
      showNotification({
        type: "warning",
        title: "Campos obligatorios",
        message: "Completa el email, el nombre de usuario y la contraseña.",
      });
      return;
    }

    if (password.length < 10) {
      showNotification({
        type: "error",
        title: "Contraseña no válida",
        message: "La contraseña debe tener al menos 10 caracteres.",
      });
      passwordInput.focus();
      return;
    }

    const newUser = {
      email: email,
      username: username,
      password: password,
      role: roleSelect.value,
    };

    try {
      saveButton.disabled = true;
      await setUser(newUser);
      await showUsers();
      overlay.remove();
      showNotification({
        type: "success",
        title: "Usuario creado",
        message: `Se ha creado el usuario ${username}.`,
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "No se pudo crear el usuario",
        message: getCreateUserErrorMessage(error),
        duration: 7000,
      });
    } finally {
      saveButton.disabled = false;
    }
  });

  const cancelButton = createCancelButton(overlay);

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(saveButton, cancelButton);

  modal.append(closeButton);
  modal.append(title);
  modal.append(createField("Email", emailInput));
  modal.append(createField("Nombre de usuario", usernameInput));
  modal.append(createField("Password", passwordInput));
  modal.append(createField("Rol", roleSelect));
  modal.append(actions);

  overlay.append(modal);
  return overlay;
}

function createRoleSelect(id) {
  const select = document.createElement("select");
  select.name = "role";
  select.id = id;

  const adminOption = document.createElement("option");
  adminOption.value = "ADMIN";
  adminOption.textContent = "ADMIN";

  const userOption = document.createElement("option");
  userOption.value = "USER";
  userOption.textContent = "USER";

  select.append(adminOption, userOption);
  return select;
}

function createField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("user-modal-field");

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

function getCreateUserErrorMessage(error) {
  return error.message || "Ha ocurrido un error inesperado.";
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
