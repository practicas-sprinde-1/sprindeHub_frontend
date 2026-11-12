import { setUser } from "../api/user.api.js";
import { showNotification } from "../components/notifications.js";

export function createNewUserModal(refreshUsers) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("user-modal");

  const closeModal = () => overlay.remove();
  const userForm = createUserForm();
  const modalActions = createModalActions({
    onSave: (saveButton) =>
      submitNewUser({
        formInputs: userForm.inputs,
        saveButton,
        refreshUsers,
        closeModal,
      }),
    onCancel: closeModal,
  });

  modal.append(
    createCloseButton(closeModal),
    createModalTitle(),
    ...userForm.fields,
    modalActions,
  );
  overlay.append(modal);

  return overlay;
}

function createModalTitle() {
  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = "Crear usuario";

  return title;
}

function createUserForm() {
  const emailInput = createRequiredInput({ type: "email", name: "email" });
  const usernameInput = createRequiredInput({
    type: "text",
    name: "username",
  });
  const passwordInput = createRequiredInput({
    type: "password",
    name: "password",
  });
  const roleSelect = createRoleSelect();

  return {
    fields: [
      createField("Email", emailInput),
      createField("Nombre de usuario", usernameInput),
      createField("Password", passwordInput),
      createField("Rol", roleSelect),
    ],
    inputs: { emailInput, usernameInput, passwordInput, roleSelect },
  };
}

function createModalActions({ onSave, onCancel }) {
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";
  saveButton.addEventListener("click", () => onSave(saveButton));

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(saveButton, createCancelButton(onCancel));

  return actions;
}

function createRequiredInput({ type, name }) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.id = `new-user-${name}`;
  input.required = true;

  return input;
}

async function submitNewUser({
  formInputs,
  saveButton,
  refreshUsers,
  closeModal,
}) {
  const newUser = readNewUserForm(formInputs);

  if (!validateNewUser(newUser, formInputs.passwordInput)) {
    return;
  }

  try {
    saveButton.disabled = true;
    await setUser(newUser);
    await refreshUsers();
    closeModal();
    showNotification({
      type: "success",
      title: "Usuario creado",
      message: `Se ha creado el usuario ${newUser.username}.`,
    });
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se pudo crear el usuario",
      message: getErrorMessage(error),
      duration: 7000,
    });
  } finally {
    saveButton.disabled = false;
  }
}

function readNewUserForm({
  emailInput,
  usernameInput,
  passwordInput,
  roleSelect,
}) {
  return {
    email: emailInput.value.trim(),
    username: usernameInput.value.trim(),
    password: passwordInput.value,
    role: roleSelect.value,
  };
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

function createRoleSelect() {
  const roleSelect = document.createElement("select");
  roleSelect.name = "role";
  roleSelect.id = "new-user-role";

  const adminOption = createSelectOption("ADMIN");
  const userOption = createSelectOption("USER");

  roleSelect.append(adminOption, userOption);
  return roleSelect;
}

function createSelectOption(role) {
  const option = document.createElement("option");
  option.value = role;
  option.textContent = role;

  return option;
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

function createCloseButton(onClose) {
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("modal-close-button");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", onClose);

  return closeButton;
}

function createCancelButton(onCancel) {
  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", onCancel);

  return cancelButton;
}

function getErrorMessage(error) {
  return error.message || "Ha ocurrido un error inesperado.";
}
