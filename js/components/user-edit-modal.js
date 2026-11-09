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

  const formInputs = createUserFormInputs(user);
  const { clients, initialClientIds } = await loadClientAccess(user.id);
  const clientAccessList = createClientAccessList(clients, initialClientIds);

  const saveChanges = () =>
    saveUserChanges({
      user,
      refreshUsers,
      overlay,
      formInputs,
      clients,
      initialClientIds,
      clientAccessList,
    });

  modal.append(
    createCloseButton(overlay),
    title,
    createField("Email", formInputs.emailInput),
    createField("Nombre de usuario", formInputs.usernameInput),
    createField("Rol", formInputs.roleSelect),
    clientAccessList.element,
    createModalActions(overlay, saveChanges),
  );

  overlay.append(modal);
  return overlay;
}

function createUserFormInputs(user) {
  const roleSelect = createRoleSelect();
  roleSelect.value = user.role;

  return {
    emailInput: createUserInput("email", "email", user.email),
    usernameInput: createUserInput("text", "username", user.username),
    roleSelect,
  };
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

async function loadClientAccess(userId) {
  const clients = await getLightClients("clients");
  const relationships = await getRelationshipByUser(userId);
  const relatedClientIds = relationships.map(
    (relationship) => relationship.client_id,
  );
  const initialClientIds = clients
    .filter((client) => relatedClientIds.includes(client.id))
    .map((client) => client.id);

  return { clients, initialClientIds };
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
  formInputs,
  clients,
  initialClientIds,
  clientAccessList,
}) {
  try {
    const userChanges = getUserChanges(formInputs);

    if (!userChanges) {
      return;
    }

    user.email = userChanges.email;
    user.username = userChanges.username;
    user.role = userChanges.role;

    await persistUserChanges({
      user,
      clients,
      initialClientIds,
      selectedClientIds: clientAccessList.getSelectedClientIds(),
    });

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

function getUserChanges({ emailInput, usernameInput, roleSelect }) {
  const email = emailInput.value.trim();
  const username = usernameInput.value.trim();

  if (email === "" || username === "") {
    return null;
  }

  return { email, username, role: roleSelect.value };
}

async function persistUserChanges({
  user,
  clients,
  initialClientIds,
  selectedClientIds,
}) {
  await modifyUser(user, user.id);
  await updateClientAccess(
    user.id,
    clients,
    initialClientIds,
    selectedClientIds,
  );
}

async function updateClientAccess(
  userId,
  clients,
  initialClientIds,
  selectedClientIds,
) {
  const { addedClients, removedClients } = getClientAccessChanges(
    clients,
    initialClientIds,
    selectedClientIds,
  );

  for (const client of addedClients) {
    await assignUserToClient({ client_id: client.id }, userId);
  }

  for (const client of removedClients) {
    await revokeClientAccess(userId, client.id);
  }
}

function getClientAccessChanges(clients, initialClientIds, selectedClientIds) {
  const addedClientIds = selectedClientIds.filter(
    (clientId) => !initialClientIds.includes(clientId),
  );
  const removedClientIds = initialClientIds.filter(
    (clientId) => !selectedClientIds.includes(clientId),
  );

  return {
    addedClients: clients.filter((client) =>
      addedClientIds.includes(client.id),
    ),
    removedClients: clients.filter((client) =>
      removedClientIds.includes(client.id),
    ),
  };
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

function createClientAccessList(clients, initialClientIds) {
  const section = document.createElement("section");
  section.classList.add("user-client-access");

  const title = document.createElement("h2");
  title.textContent = "Clientes";

  const list = document.createElement("ul");
  list.classList.add("user-client-access-list");

  let selectedClientIds = [...initialClientIds];
  const orderedClients = orderClientsByAccess(clients, initialClientIds);

  orderedClients.forEach((client) => {
    const { element, checkbox } = createClientAccessOption(
      client,
      initialClientIds,
    );

    checkbox.addEventListener("change", () => {
      selectedClientIds = updateSelectedClientIds(
        selectedClientIds,
        client.id,
        checkbox.checked,
      );
    });

    list.append(element);
  });

  section.append(title, list);

  return {
    element: section,
    getSelectedClientIds: () => selectedClientIds,
  };
}

function orderClientsByAccess(clients, initialClientIds) {
  const assignedClients = clients.filter((client) =>
    initialClientIds.includes(client.id),
  );
  const unassignedClients = clients.filter(
    (client) => !initialClientIds.includes(client.id),
  );

  return [...assignedClients, ...unassignedClients];
}

function createClientAccessOption(client, initialClientIds) {
  const listItem = document.createElement("li");
  const label = document.createElement("label");
  label.classList.add("user-client-access-option");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = initialClientIds.includes(client.id);

  const clientName = document.createElement("span");
  clientName.textContent = client.name;

  label.append(checkbox, clientName);
  listItem.append(label);

  return { element: listItem, checkbox };
}

function updateSelectedClientIds(selectedClientIds, clientId, isSelected) {
  if (!isSelected) {
    return selectedClientIds.filter(
      (selectedClientId) => selectedClientId !== clientId,
    );
  }

  if (selectedClientIds.includes(clientId)) {
    return selectedClientIds;
  }

  selectedClientIds.push(clientId);
  return selectedClientIds;
}
