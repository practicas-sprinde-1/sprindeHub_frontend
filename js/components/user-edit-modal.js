import { getLightClients } from "../api/client.api.js";
import { modifyUser } from "../api/user.api.js";
import {
  assignUserToClient,
  getRelationshipByUser,
  revokeClientAccess,
} from "../api/user_client.api.js";
import { showNotification } from "./notifications.js";

export async function createEditUserModal(user, refreshUsers) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("user-modal");

  const title = document.createElement("h1");
  title.classList.add("modal-title");
  title.textContent = `Modificando usuario: ${user.username}`;

  const closeButton = createCloseButton(overlay);

  const emailInput = createUserInput("email", "email", user.email);
  const usernameInput = createUserInput("text", "username", user.username);
  const roleSelect = createRoleSelect();
  roleSelect.value = user.role;

  const clients = await getLightClients("clients");
  const relationships = await getRelationshipByUser(user.id);

  const relatedClientIds = relationships.map(
    (relationship) => relationship.client_id,
  );

  const initialClients = clients.filter((client) =>
    relatedClientIds.includes(client.id),
  );

  const initialClientIds = initialClients.map((client) => client.id);

  const clientCheckboxList = createClientCheckboxList(
    clients,
    initialClientIds,
  );

  const actions = createModalActions(overlay, () =>
    saveUserChanges({
      user,
      refreshUsers,
      overlay,
      emailInput,
      usernameInput,
      roleSelect,
      clients,
      initialClientIds,
      clientCheckboxList,
    }),
  );

  modal.append(closeButton);
  modal.append(title);
  modal.append(createField("Email", emailInput));
  modal.append(createField("Nombre de usuario", usernameInput));
  modal.append(createField("Rol", roleSelect));
  modal.append(clientCheckboxList.element);
  modal.append(actions);

  overlay.append(modal);
  return overlay;
}

function createUserInput(type, name, value) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.id = `edit-user-${name}`;
  input.required = true;
  input.value = value;
  return input;
}

function createModalActions(overlay, onSave) {
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";
  saveButton.addEventListener("click", onSave);

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(saveButton, createCancelButton(overlay));
  return actions;
}

async function saveUserChanges({
  user,
  refreshUsers,
  overlay,
  emailInput,
  usernameInput,
  roleSelect,
  clients,
  initialClientIds,
  clientCheckboxList,
}) {
  try {
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();

    if (email === "" || username === "") {
      return;
    }

    user.email = email;
    user.username = username;
    user.role = roleSelect.value;

    await modifyUser(user, user.id);
    await updateClientAccess(
      user.id,
      clients,
      initialClientIds,
      clientCheckboxList.getSelectedClientIds(),
    );

    refreshUsers();
    overlay.remove();
    showNotification({
      type: "success",
      title: "Usuario modificado",
      message: "Los cambios se han guardado correctamente.",
    });
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se ha podido modificar el usuario",
      message: error.message,
      duration: 7000,
    });
  }
}

async function updateClientAccess(userId, clients, initialClientIds, selectedClientIds) {
  const addedClientIds = selectedClientIds.filter(
    (clientId) => !initialClientIds.includes(clientId),
  );
  const removedClientIds = initialClientIds.filter(
    (clientId) => !selectedClientIds.includes(clientId),
  );
  const addedClients = clients.filter((client) => addedClientIds.includes(client.id));
  const removedClients = clients.filter((client) => removedClientIds.includes(client.id));

  for (const client of addedClients) {
    await assignUserToClient({ client_id: client.id }, userId);
  }

  for (const client of removedClients) {
    await revokeClientAccess(userId, client.id);
  }
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

function createClientCheckboxList(clients, initialClientIds) {
  const section = document.createElement("section");
  section.classList.add("user-client-access");
  const title = document.createElement("h2");
  title.textContent = "Clientes";

  const list = document.createElement("ul");
  list.classList.add("user-client-access-list");

  let selectedClientIds = [...initialClientIds];

  const assignedClients = clients.filter((client) => {
    return initialClientIds.includes(client.id);
  });

  const unassignedClients = clients.filter((client) => {
    return !initialClientIds.includes(client.id);
  });

  const orderedClients = [...assignedClients, ...unassignedClients];

  orderedClients.forEach((client) => {
    const listItem = document.createElement("li");
    const label = document.createElement("label");
    label.classList.add("user-client-access-option");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const clientName = document.createElement("span");
    clientName.textContent = client.name;

    checkbox.checked = initialClientIds.includes(client.id);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (selectedClientIds.includes(client.id)) {
          return;
        }

        selectedClientIds.push(client.id);
        return;
      }

      selectedClientIds = selectedClientIds.filter((clientId) => {
        return clientId !== client.id;
      });
    });

    label.append(checkbox, clientName);
    listItem.append(label);
    list.append(listItem);
  });

  section.append(title, list);

  return {
    element: section,
    getSelectedClientIds: () => {
      return selectedClientIds;
    },
  };
}
