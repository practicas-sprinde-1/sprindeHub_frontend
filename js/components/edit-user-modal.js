import { modifyUser } from "../api/user.api.js";

export function createEditUserModal(user, showUsers) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("user-modal");

  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = `Modificando usuario: ${user.username}`;

  const closeButton = createCloseButton(overlay);

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.name = "email";
  emailInput.id = "edit-user-email";
  emailInput.required = true;

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.name = "username";
  usernameInput.id = "edit-user-username";
  usernameInput.required = true;

  const roleSelect = createRoleSelect();
  emailInput.value = user.email;
  usernameInput.value = user.username;
  roleSelect.value = user.role;

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";
  saveButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();

    if (email === "" || username === "") {
      return;
    }

    user.email = email;
    user.username = username;
    user.role = roleSelect.value;

    console.log(user);
    await modifyUser(user, user.id);

    showUsers();
    overlay.remove();
  });

  const cancelButton = createCancelButton(overlay);

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(saveButton, cancelButton);

  modal.append(closeButton);
  modal.append(title);
  modal.append(createField("Email", emailInput));
  modal.append(createField("Nombre de usuario", usernameInput));
  modal.append(createField("Rol", roleSelect));
  modal.append(actions);

  overlay.append(modal);
  return overlay;
}

function createRoleSelect() {
  const select = document.createElement("select");
  select.name = "role";
  select.id = "edit-user-role";

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
