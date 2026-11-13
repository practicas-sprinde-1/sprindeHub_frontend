import { modifyClient } from "../api/client.api.js";
import { getProfile } from "../api/profile.api.js";
import { getLightProjects, modifyProject } from "../api/project.api.js";
import {
  getRelationshipByUser,
  revokeClientAccess,
} from "../api/user_client.api.js";
import { createCheckboxListManager } from "../components/checkbox-list-manager.js";
import { showNotification } from "../components/notifications.js";

export async function createEditModalClient(
  client,
  onSaveSuccess,
  assignedProjects = [],
) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("client-edit-modal");

  const closeModal = () => overlay.remove();
  const title = createModalTitle(client.name);
  const closeButton = createCloseButton(closeModal);
  const clientForm = createClientForm(client);

  const availableProjects = await getLightProjects("projects");
  const initialProjectIds = assignedProjects.map((project) => project.id);
  const projectSelection = createProjectSelection(
    availableProjects,
    initialProjectIds,
  );

  const currentUser = await getProfile();
  const currentUserRelationships = await getRelationshipByUser(currentUser.id);
  const currentUserHadAccess = currentUserRelationships.some(
    (relationship) => relationship.client_id === client.id,
  );
  const userAccessSection = createUserAccessSection(
    currentUser.username,
    currentUserHadAccess,
  );

  const modalActions = createModalActions({
    onSave: () =>
      saveClientChanges({
        client,
        clientInputs: clientForm.inputs,
        availableProjects,
        initialProjectIds,
        selectedProjectIds: projectSelection.getSelectedProjectIds(),
        currentUserId: currentUser.id,
        currentUserHadAccess,
        userAccessSection: userAccessSection,
        onSaveSuccess,
        closeModal,
      }),
    onCancel: closeModal,
  });

  modal.append(closeButton, title, ...clientForm.fields);
  if (currentUserHadAccess) {
    modal.append(userAccessSection.element);
  }
  modal.append(projectSelection.element, modalActions);

  overlay.append(modal);
  return overlay;
}

function createModalTitle(clientName) {
  const title = document.createElement("h1");
  title.textContent = `Editando cliente: ${clientName}`;
  title.classList.add("modal-title");
  return title;
}

function createCloseButton(onClose) {
  const closeButton = document.createElement("button");
  closeButton.classList.add("modal-close-button");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.addEventListener("click", onClose);
  return closeButton;
}

function createModalActions({ onSave, onCancel }) {
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");
  saveButton.addEventListener("click", onSave);

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.addEventListener("click", onCancel);

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(saveButton, cancelButton);
  return actions;
}

async function saveClientChanges({
  client,
  clientInputs,
  availableProjects,
  initialProjectIds,
  selectedProjectIds,
  currentUserId,
  currentUserHadAccess,
  userAccessSection: userAccessSection,
  onSaveSuccess,
  closeModal,
}) {
  try {
    applyClientFormValues(client, clientInputs);
    await modifyClient(client, client.id);

    await updateClientProjects(
      availableProjects,
      initialProjectIds,
      selectedProjectIds,
      client.id,
    );
    await checkAndRemoveAccess(
      currentUserId,
      client.id,
      currentUserHadAccess,
      userAccessSection,
    );

    await onSaveSuccess(client);
    closeModal();
    showNotification({
      type: "success",
      title: "Cliente modificado",
      message: "Los cambios se han guardado correctamente.",
    });
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se ha podido modificar el cliente",
      message: error.message,
      duration: 7000,
    });
  }
}

function createClientForm(client) {
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "name";
  nameInput.value = client.name;

  const cifInput = document.createElement("input");
  cifInput.type = "text";
  cifInput.name = "cif";
  cifInput.value = client.cif;

  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.name = "phone";
  phoneInput.value = client.phone;

  const statusInput = document.createElement("select");
  statusInput.name = "is_active";

  const activeOption = document.createElement("option");
  activeOption.value = "true";
  activeOption.textContent = "Activo";

  const inactiveOption = document.createElement("option");
  inactiveOption.value = "false";
  inactiveOption.textContent = "Inactivo";

  statusInput.append(activeOption, inactiveOption);
  statusInput.value = String(client.is_active);

  return {
    fields: [
      createClientField("Nombre", nameInput),
      createClientField("CIF", cifInput),
      createClientField("Teléfono", phoneInput),
      createClientStatusField(statusInput),
    ],
    inputs: { nameInput, cifInput, phoneInput, statusInput },
  };
}

function applyClientFormValues(
  client,
  { nameInput, cifInput, phoneInput, statusInput },
) {
  client.name = nameInput.value.trim();
  client.cif = cifInput.value.trim();
  client.phone = phoneInput.value.trim();
  client.is_active = statusInput.value === "true";
}

async function updateClientProjects(
  projects,
  initialProjectIds,
  selectedProjectIds,
  clientId,
) {
  const addedProjectIds = selectedProjectIds.filter(
    (projectId) => !initialProjectIds.includes(projectId),
  );
  const addedProjects = projects.filter((project) =>
    addedProjectIds.includes(project.id),
  );
  const removedProjectIds = initialProjectIds.filter(
    (projectId) => !selectedProjectIds.includes(projectId),
  );
  const removedProjects = projects.filter((project) =>
    removedProjectIds.includes(project.id),
  );

  for (const project of addedProjects) {
    await modifyProject({ client_id: clientId }, project.id);
  }
  for (const project of removedProjects) {
    await modifyProject({ client_id: null }, project.id);
  }
}

async function checkAndRemoveAccess(
  userId,
  clientId,
  hadAccess,
  userAccessSection,
) {
  if (!hadAccess || userAccessSection.hasAccessSelected()) return;

  await revokeClientAccess(userId, clientId);
}

function createClientField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("client-edit-field");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.name;
  input.id = input.name;

  field.append(label, input);
  return field;
}

function createClientStatusField(statusInput) {
  const field = document.createElement("div");
  field.classList.add("client-edit-field");

  const label = document.createElement("label");
  label.textContent = "Estado";
  label.htmlFor = statusInput.name;
  statusInput.id = statusInput.name;

  const statusContainer = document.createElement("div");
  statusContainer.classList.add("client-status-container");

  const indicator = document.createElement("span");
  indicator.classList.add("client-status-indicator");

  const updateStatusIndicator = () => {
    const isActive = statusInput.value === "true";
    indicator.classList.toggle("client-status-indicator--active", isActive);
    indicator.classList.toggle("client-status-indicator--inactive", !isActive);
  };

  statusInput.addEventListener("change", updateStatusIndicator);
  updateStatusIndicator();

  statusContainer.append(indicator, statusInput);
  field.append(label, statusContainer);
  return field;
}

function createProjectSelection(projects, initialProjectIds) {
  const section = document.createElement("section");
  section.classList.add("project-selection");

  const title = document.createElement("h2");
  title.textContent = "Proyectos";

  const selectionToolbar = createProjectSelectionToolbar();

  const list = document.createElement("ul");
  list.classList.add("project-selection-list");
  list.dataset.checkboxList = "";

  const orderedProjects = orderProjectsByAssignment(
    projects,
    initialProjectIds,
  );

  orderedProjects.forEach((project) => {
    const projectOption = createProjectSelectionOption(
      project,
      initialProjectIds,
    );

    list.append(projectOption);
  });

  section.append(title, selectionToolbar, list);

  const checkboxListManager = createCheckboxListManager(section);

  return {
    element: section,
    getSelectedProjectIds: () => {
      const selectedProjectValues = checkboxListManager.getSelectedValues();

      // Los valores de los inputs son texto, pero la API trabaja con IDs numéricos.
      return selectedProjectValues.map((projectValue) => {
        return Number(projectValue);
      });
    },
  };
}

function createProjectSelectionToolbar() {
  const toolbar = document.createElement("div");
  toolbar.classList.add("project-selection-toolbar");

  const counterText = document.createElement("span");
  counterText.classList.add("project-selection-counter");
  counterText.textContent = "Seleccionados: ";

  const counterValue = document.createElement("span");
  counterValue.dataset.checkboxCounter = "";

  const searchLabel = document.createElement("label");
  searchLabel.classList.add("project-selection-search");

  const searchLabelText = document.createElement("span");
  searchLabelText.textContent = "Buscar proyectos";

  const searchInput = document.createElement("input");
  searchInput.dataset.checkboxSearch = "";
  searchInput.type = "search";
  searchInput.placeholder = "Escribe el nombre de un proyecto";

  counterText.append(counterValue);
  searchLabel.append(searchLabelText, searchInput);
  toolbar.append(counterText, searchLabel);

  return toolbar;
}

function orderProjectsByAssignment(projects, initialProjectIds) {
  const assignedProjects = projects.filter((project) => {
    return initialProjectIds.includes(project.id);
  });

  const unassignedProjects = projects.filter((project) => {
    return !initialProjectIds.includes(project.id);
  });

  return [...assignedProjects, ...unassignedProjects];
}

function createProjectSelectionOption(project, initialProjectIds) {
  const listItem = document.createElement("li");
  listItem.dataset.checkboxItem = "";

  const label = document.createElement("label");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = String(project.id);
  checkbox.checked = initialProjectIds.includes(project.id);

  const projectName = document.createElement("span");
  projectName.textContent = project.name;

  label.append(checkbox, projectName);
  listItem.append(label);

  return listItem;
}

function createUserAccessSection(username, startsWithAccess) {
  const section = document.createElement("section");
  section.classList.add("client-user-access");
  const title = document.createElement("h2");
  title.textContent = "Usuarios";

  const label = document.createElement("label");
  label.classList.add("client-user-access-option");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const usernameText = document.createElement("span");
  usernameText.textContent = username;

  let isAccessSelected = startsWithAccess;
  checkbox.checked = isAccessSelected;

  checkbox.addEventListener("change", () => {
    isAccessSelected = checkbox.checked;
  });

  label.append(checkbox, usernameText);

  section.append(title, label);

  return {
    element: section,
    hasAccessSelected: () => isAccessSelected,
  };
}
