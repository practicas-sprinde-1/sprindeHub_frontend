import {
  archiveClient,
  modifyClient,
  restoreClient,
} from "../api/client.api.js";
import { getProfile } from "../api/profile.api.js";
import { getLightProjects, modifyProject } from "../api/project.api.js";
import {
  deleteTag,
  getTagsByClientId,
  modifyTag,
  setTag,
} from "../api/tag.api.js";
import {
  getRelationshipByUser,
  revokeClientAccess,
} from "../api/user_client.api.js";
import { createCheckboxListManager } from "../components/checkbox-list-manager.js";
import {
  createTagEditorFields,
  getTagChanges,
} from "../components/tag-form.js";
import { showNotification } from "../components/notifications.js";

const SAVE_ERROR_DURATION = 7000;
let inputId = 0;

export async function createEditModalClient(
  client,
  onSaveSuccess,
  assignedProjects = [],
) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("client-edit-modal");

  const closeModal = async () => {
    overlay.remove();
    if (tagsSection.hasSavedChanges) {
      try {
        await onSaveSuccess(client);
      } catch (error) {
        showNotification({
          type: "error",
          title: "No se ha podido actualizar la ficha del cliente",
          message: error.message,
          duration: 7000,
        });
      }
    }
  };
  const title = createModalTitle(client.name);
  const closeButton = createCloseButton();
  closeButton.addEventListener("click", closeModal);
  const clientForm = createClientForm(client);

  const availableProjects = await getLightProjects("projects");
  const tags = await getTagsByClientId(client.id, 100, 0);

  const tagsSection = createTagsSection(tags, client.id);
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

  const modalActions = createModalActions();
  modalActions.saveButton.addEventListener("click", async () => {
    await saveClientChanges({
      client,
      clientInputs: clientForm.inputs,
      availableProjects,
      initialProjectIds,
      selectedProjectIds: projectSelection.getSelectedProjectIds(),
      currentUserId: currentUser.id,
      currentUserHadAccess,
      userAccessSection,
      onSaveSuccess,
      overlay,
    });
  });
  modalActions.cancelButton.addEventListener("click", closeModal);

  const layout = document.createElement("div");
  layout.classList.add("client-edit-layout");
  const sections = buildClientSections(
    clientForm.fields,
    projectSelection,
    tagsSection,
    userAccessSection,
  );
  layout.append(...sections);
  modal.append(closeButton, title, layout, modalActions.element);

  overlay.append(modal);
  return overlay;
}

function createModalTitle(clientName) {
  const title = document.createElement("h1");
  title.textContent = `Editando cliente: ${clientName}`;
  title.classList.add("modal-title");
  return title;
}

function buildClientSections(
  clientFields,
  projectSelection,
  tagsSection,
  userAccessSection,
) {
  return [
    createClientDataSection(clientFields),
    projectSelection.element,
    tagsSection.element,
    userAccessSection.element,
  ];
}

function createClientDataSection(clientFields) {
  const section = document.createElement("section");
  section.classList.add("client-data-section");
  const title = document.createElement("h2");
  title.textContent = "Datos del cliente";
  const fields = document.createElement("div");
  fields.classList.add("client-data-fields");
  fields.append(...clientFields);
  section.append(title, fields);
  return section;
}

function createTagsSection(tags, clientId) {
  const section = document.createElement("section");
  section.classList.add("client-tag-section");
  const title = document.createElement("h2");
  title.textContent = "Dispositivos";
  const description = document.createElement("p");
  description.classList.add("client-tag-description");
  description.textContent = "Los dispositivos se guardan de forma individual.";
  const list = document.createElement("ul");
  const addButton = createButton("Añadir dispositivo", "modal-add-button");

  const tagsSection = {
    element: section,
    tags,
    clientId,
    hasSavedChanges: false,
  };

  addButton.addEventListener("click", () => {
    const listItem = document.createElement("li");
    list.append(listItem);
    renderTagEditor(listItem, {}, tagsSection, true);
  });

  for (const tag of tags) {
    const listItem = document.createElement("li");
    renderTagReadView(listItem, tag, tagsSection);
    list.append(listItem);
  }

  section.append(title, description, list, addButton);
  return tagsSection;
}

function renderTagReadView(listItem, tag, tagsSection) {
  const content = document.createElement("div");
  content.classList.add("client-tag-content");
  const name = document.createElement("strong");
  name.textContent = `${tag.tag_type} · ${tag.brand} ${tag.model}`;
  const details = document.createElement("span");
  details.textContent = `MAC: ${tag.mac || "—"} · IP: ${tag.ip || "—"}`;
  content.append(name, details);

  const editButton = createButton("Editar");
  editButton.addEventListener("click", () => {
    renderTagEditor(listItem, tag, tagsSection);
  });
  const deleteButton = createTagDeleteButton(
    listItem,
    tag,
    tagsSection,
    editButton,
  );
  listItem.replaceChildren(content, editButton, deleteButton);
}

function createTagDeleteButton(listItem, tag, tagsSection, editButton) {
  const deleteButton = createButton("Eliminar");
  deleteButton.addEventListener("click", async () => {
    if (deleteButton.disabled) return;

    listItem.dataset.deleting = "";
    editButton.disabled = true;
    deleteButton.disabled = true;
    deleteButton.textContent = "Eliminando...";
    try {
      await deleteTag(tag.id);
      const tagIndex = tagsSection.tags.indexOf(tag);
      if (tagIndex !== -1) {
        tagsSection.tags.splice(tagIndex, 1);
      }
      tagsSection.hasSavedChanges = true;
      listItem.remove();
    } catch (error) {
      showNotification({
        type: "error",
        title: "No se ha podido eliminar el dispositivo",
        message: error.message,
        duration: SAVE_ERROR_DURATION,
      });
    } finally {
      delete listItem.dataset.deleting;
      editButton.disabled = false;
      deleteButton.disabled = false;
      deleteButton.textContent = "Eliminar";
    }
  });
  return deleteButton;
}

function renderTagEditor(listItem, tag, tagsSection, isNew = false) {
  const form = document.createElement("form");
  form.classList.add("client-tag-editor");
  const fields = document.createElement("fieldset");
  const { inputs, inputElements } = createTagEditorFields(
    tag,
    "client-edit-field",
  );
  fields.append(...inputElements);

  const saveButton = createButton("Guardar", "modal-save-button");
  saveButton.type = "submit";
  const cancelButton = createButton("Cancelar", "modal-cancel-button");
  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
    } else {
      renderTagReadView(listItem, tag, tagsSection);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveTag(listItem, tag, inputs, fields, tagsSection, isNew);
  });

  fields.append(saveButton, cancelButton);
  form.append(fields);
  listItem.replaceChildren(form);
}

async function saveTag(
  listItem,
  tag,
  inputs,
  fields,
  tagsSection,
  isNew,
) {
  if (fields.disabled) return;

  fields.disabled = true;
  try {
    const changes = getTagChanges(inputs);
    const savedTag = await updateTag(
      tag,
      changes,
      tagsSection,
      isNew,
    );
    tagsSection.hasSavedChanges = true;
    renderTagReadView(listItem, savedTag, tagsSection);
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se ha podido guardar el dispositivo",
      message: error.message,
      duration: SAVE_ERROR_DURATION,
    });
  } finally {
    fields.disabled = false;
  }
}

async function updateTag(tag, changes, tagsSection, isNew) {
  if (isNew) {
    const createdTag = await setTag({
      ...changes,
      client_id: tagsSection.clientId,
    });
    tagsSection.tags.push(createdTag);
    return createdTag;
  }

  // El backend solo admite los campos editables, sin id ni client_id.
  const savedTag = await modifyTag(changes, tag.id);
  Object.assign(tag, savedTag);
  return tag;
}

function createElement(tagName, className) {
  const element = document.createElement(tagName);
  if (className) element.classList.add(className);
  return element;
}

function createInput(type, value, name = "", placeholder = "") {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = value ?? "";
  input.placeholder = placeholder;
  return input;
}

function createField(labelText, input) {
  const field = createElement("div", "client-edit-field");
  field.append(createLabel(labelText, input), input);
  return field;
}

function createLabel(text, input) {
  const label = document.createElement("label");
  // Cada editor necesita sus propios IDs para poder abrir varias filas a la vez.
  inputId += 1;
  input.id = `client-edit-${input.name}-${inputId}`;
  label.htmlFor = input.id;
  label.textContent = text;
  return label;
}

function createButton(text, className = "") {
  const button = createElement("button", className);
  button.type = "button";
  button.textContent = text;
  return button;
}

function createCloseButton() {
  return createButton("×", "modal-close-button");
}

function createModalActions() {
  const saveButton = createButton("Guardar", "modal-save-button");
  const cancelButton = createButton("Cancelar", "modal-cancel-button");

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(saveButton, cancelButton);
  return { element: actions, saveButton, cancelButton };
}

async function saveClientChanges({
  client,
  clientInputs,
  availableProjects,
  initialProjectIds,
  selectedProjectIds,
  currentUserId,
  currentUserHadAccess,
  userAccessSection,
  onSaveSuccess,
  overlay,
}) {
  try {
    const shouldClientBeActive = clientInputs.statusInput.value === "true";
    applyClientFormValues(client, clientInputs);
    await modifyClient(client, client.id);

    if (shouldClientBeActive && !client.is_active) {
      await restoreClient(client.id);
      client.is_active = true;
    }

    await updateClientProjects(
      availableProjects,
      initialProjectIds,
      selectedProjectIds,
      client.id,
    );

    if (!shouldClientBeActive && client.is_active) {
      await archiveClient(client.id);
      client.is_active = false;
    }

    await checkAndRemoveAccess(
      currentUserId,
      client.id,
      currentUserHadAccess,
      userAccessSection,
    );

    await onSaveSuccess(client);
    overlay.remove();
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
  const nameInput = createInput("text", client.name, "name");
  const cifInput = createInput("text", client.cif, "cif");
  const phoneInput = createInput("tel", client.phone, "phone");

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
      createField("Nombre", nameInput),
      createField("CIF", cifInput),
      createField("Teléfono", phoneInput),
      createClientStatusField(statusInput),
    ],
    inputs: { nameInput, cifInput, phoneInput, statusInput },
  };
}

function applyClientFormValues(client, { nameInput, cifInput, phoneInput }) {
  client.name = nameInput.value.trim();
  client.cif = cifInput.value.trim();
  client.phone = phoneInput.value.trim();
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

function createClientStatusField(statusInput) {
  const field = document.createElement("div");
  field.classList.add("client-edit-field");

  const label = createLabel("Estado", statusInput);

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

  section.append(title);
  if (startsWithAccess) {
    section.append(label);
  } else {
    const emptyMessage = document.createElement("p");
    emptyMessage.classList.add("client-user-access-empty");
    emptyMessage.textContent = "Tu usuario no está asignado a este cliente.";
    section.append(emptyMessage);
  }

  return {
    element: section,
    hasAccessSelected: () => isAccessSelected,
  };
}
