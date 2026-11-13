import { modifyClient } from "../api/client.api.js";
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
    if (deviceSection.hasChanges) {
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
  const devices = await getTagsByClientId(client.id, 100, 0);

  const deviceSection = createDeviceSection(devices, client.id);
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
    deviceSection,
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
  deviceSection,
  userAccessSection,
) {
  return [
    createClientDataSection(clientFields),
    projectSelection.element,
    deviceSection.element,
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

function createDeviceSection(devices, clientId) {
  const section = document.createElement("section");
  section.classList.add("client-device-section");
  const title = document.createElement("h2");
  title.textContent = "Dispositivos";
  const description = document.createElement("p");
  description.classList.add("client-device-description");
  description.textContent = "Los dispositivos se guardan de forma individual.";
  const list = document.createElement("ul");
  const addButton = createButton(
    "Añadir dispositivo",
    "modal-add-button",
  );

  const deviceSection = {
    element: section,
    devices,
    clientId,
    hasChanges: false,
  };

  addButton.addEventListener("click", () => {
    const listItem = document.createElement("li");
    list.append(listItem);
    renderDeviceEditor(listItem, {}, deviceSection, true);
  });

  for (const device of devices) {
    const listItem = document.createElement("li");
    renderDeviceReadView(listItem, device, deviceSection);
    list.append(listItem);
  }

  section.append(title, description, list, addButton);
  return deviceSection;
}

function renderDeviceReadView(listItem, device, deviceSection) {
  const content = document.createElement("div");
  content.classList.add("client-device-content");
  const name = document.createElement("strong");
  name.textContent = `${device.device_type} · ${device.brand} ${device.model}`;
  const details = document.createElement("span");
  details.textContent = `MAC: ${device.mac || "—"} · IP: ${device.ip || "—"}`;
  content.append(name, details);

  const editButton = createButton("Editar");
  editButton.addEventListener("click", () => {
    renderDeviceEditor(listItem, device, deviceSection);
  });
  const deleteButton = createDeviceDeleteButton(listItem, device, deviceSection, editButton);
  listItem.replaceChildren(content, editButton, deleteButton);
}

function createDeviceDeleteButton(listItem, device, deviceSection, editButton) {
  const deleteButton = createButton("Eliminar");
  deleteButton.addEventListener("click", async () => {
    if (deleteButton.disabled) return;

    listItem.dataset.deleting = "";
    editButton.disabled = true;
    deleteButton.disabled = true;
    deleteButton.textContent = "Eliminando...";
    try {
      await deleteTag(device.id);
      const deviceIndex = deviceSection.devices.indexOf(device);
      if (deviceIndex !== -1) {
        deviceSection.devices.splice(deviceIndex, 1);
      }
      deviceSection.hasChanges = true;
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

function renderDeviceEditor(listItem, device, deviceSection, isNew = false) {
  const form = document.createElement("form");
  form.classList.add("client-device-editor");
  const fields = document.createElement("fieldset");
  const { inputs, inputElements } = createDeviceEditorFields(device);
  fields.append(...inputElements);

  const saveButton = createButton("Guardar", "modal-save-button");
  saveButton.type = "submit";
  const cancelButton = createButton("Cancelar", "modal-cancel-button");
  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
    } else {
      renderDeviceReadView(listItem, device, deviceSection);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveDevice(listItem, device, inputs, fields, deviceSection, isNew);
  });

  fields.append(saveButton, cancelButton);
  form.append(fields);
  listItem.replaceChildren(form);
}

function createDeviceForm(device) {
  const deviceType = createInput("text", device.device_type, "device_type");
  const brand = createInput("text", device.brand, "brand");
  const model = createInput("text", device.model, "model");
  const mac = createInput("text", device.mac, "mac");
  const ip = createInput("text", device.ip, "ip");

  deviceType.maxLength = 50;
  brand.maxLength = 50;
  model.maxLength = 100;
  mac.maxLength = 255;
  ip.maxLength = 255;

  deviceType.required = true;
  brand.required = true;
  model.required = true;

  return { device_type: deviceType, brand, model, mac, ip };
}

function createDeviceEditorFields(device) {
  const inputs = createDeviceForm(device);
  const inputElements = [
    createField("Dispositivo (tipo) *", inputs.device_type),
    createField("Marca *", inputs.brand),
    createField("Modelo *", inputs.model),
    createField("Dirección MAC (opcional)", inputs.mac),
    createField("Dirección IP (opcional)", inputs.ip),
  ];
  return { inputs, inputElements };
}

function getDeviceChanges(inputs) {
  return {
    device_type: inputs.device_type.value.trim(),
    brand: inputs.brand.value.trim(),
    model: inputs.model.value.trim(),
    mac: inputs.mac.value.trim() || null,
    ip: inputs.ip.value.trim() || null,
  };
}

async function saveDevice(listItem, device, inputs, fields, deviceSection, isNew) {
  if (fields.disabled) return;

  fields.disabled = true;
  try {
    const changes = getDeviceChanges(inputs);
    const savedDevice = await updateDevice(device, changes, deviceSection, isNew);
    deviceSection.hasChanges = true;
    renderDeviceReadView(listItem, savedDevice, deviceSection);
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

async function updateDevice(device, changes, deviceSection, isNew) {
  if (isNew) {
    const createdDevice = await setTag({
      ...changes,
      client_id: deviceSection.clientId,
    });
    deviceSection.devices.push(createdDevice);
    return createdDevice;
  }

  // El backend solo admite los campos editables, sin id ni client_id.
  const savedDevice = await modifyTag(changes, device.id);
  Object.assign(device, savedDevice);
  return device;
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
