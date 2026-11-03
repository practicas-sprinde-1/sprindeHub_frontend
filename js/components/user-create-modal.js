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

  const emailInput = createRequiredInput("email", "email");
  const usernameInput = createRequiredInput("text", "username");
  const passwordInput = createRequiredInput("password", "password");

  const roleSelect = createRoleSelect("new-user-role");

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";
  saveButton.addEventListener("click", () =>
    submitNewUser({
      emailInput,
      usernameInput,
      passwordInput,
      roleSelect,
      saveButton,
      overlay,
      refreshUsers: showUsers,
    }),
  );

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

function createRequiredInput(type, name) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.id = `new-user-${name}`;
  input.required = true;
  return input;
}

function validateNewUser({ email, username, password }, passwordInput) {
  if (email === "" || username === "" || password === "") {
    showNotification({
      type: "warning",
      title: "Campos obligatorios",
      message: "Completa el email, el nombre de usuario y la contraseña.",
    });
    return false;
  }

  if (password.length < 10) {
    showNotification({
      type: "error",
      title: "Contraseña no válida",
      message: "La contraseña debe tener al menos 10 caracteres.",
    });
    passwordInput.focus();
    return false;
  }

  return true;
}

async function submitNewUser({
  emailInput,
  usernameInput,
  passwordInput,
  roleSelect,
  saveButton,
  overlay,
  refreshUsers,
}) {
  const userDetails = {
    email: emailInput.value.trim(),
    username: usernameInput.value.trim(),
    password: passwordInput.value,
  };

  if (!validateNewUser(userDetails, passwordInput)) {
    return;
  }

  const newUser = { ...userDetails, role: roleSelect.value };

  try {
    saveButton.disabled = true;
    await setUser(newUser);
    await refreshUsers();
    overlay.remove();
    showNotification({
      type: "success",
      title: "Usuario creado",
      message: `Se ha creado el usuario ${newUser.username}.`,
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
