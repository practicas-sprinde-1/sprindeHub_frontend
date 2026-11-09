import { getLightClients } from "../api/client.api.js";
import { setFullProject } from "../api/project.api.js";
import { createHeader } from "../components/header.js";
import { showNotification } from "../components/notifications.js";

start();

function start() {
  const cachedUserData = sessionStorage.getItem("userInfo");
  const cachedUser = cachedUserData ? JSON.parse(cachedUserData) : undefined;

  document
    .querySelector("#header-container")
    .append(createHeader(cachedUser.username, "./profile.html"));

  configureProjectForm(document.querySelector("#project-form"));
}

export function configureProjectForm(form) {
  configureClientSelection(form);
  configureCollectionSections(form);
  form.addEventListener("submit", (event) => submitProject(event, form));
}

function configureCollectionSections(form) {
  form.querySelectorAll('[data-action="add-item"]').forEach((button) => {
    button.addEventListener("click", () => {
      addCollectionItem(button.closest("[data-collection]"));
    });
  });

  form.addEventListener("click", (event) => {
    const removeButton = event.target.closest('[data-action="remove-item"]');

    if (!removeButton) return;

    removeButton.closest(".collection-item").remove();
  });
}

async function submitProject(event, form) {
  event.preventDefault();

  try {
    await setFullProject(buildProjectData(form));
    window.location.href = "../index.html";
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se pudo guardar el proyecto",
      message: error.message,
      duration: 7000,
    });
  }
}

function buildProjectData(form) {
  const projectData = {
    name: form.elements["project-name"].value.trim(),
    description: form.elements.description.value.trim(),
    is_active: true,
    environments: getCollectionData(form, "environments"),
    repositories: getCollectionData(form, "repositories"),
    services: getCollectionData(form, "services"),
    domains: getCollectionData(form, "domains"),
    commands: getCollectionData(form, "commands"),
    links: getCollectionData(form, "links"),
    notes: getCollectionData(form, "notes"),
  };
  const selectedClientId = Number(form.elements["existing-client-id"].value);

  if (selectedClientId) {
    projectData.client_id = selectedClientId;
    return projectData;
  }

  projectData.client = {
    name: form.elements["client-name"].value.trim(),
    cif: form.elements.cif.value.trim(),
    phone: form.elements.phone.value.trim(),
  };

  return projectData;
}

function addCollectionItem(fieldset) {
  const templateId = fieldset.dataset.template;
  const template = document.querySelector(`#${templateId}`);
  const list = fieldset.querySelector(".collection-list");
  const newItem = template.content.cloneNode(true);

  list.append(newItem);
}

function getCollectionData(form, collectionName) {
  const fieldset = form.querySelector(`[data-collection="${collectionName}"]`);
  const items = fieldset.querySelectorAll(".collection-item");

  return Array.from(items).map((item) => {
    const fields = item.querySelectorAll("[data-field]");
    const itemData = {};

    fields.forEach((field) => {
      itemData[field.dataset.field] = field.value.trim();
    });

    return itemData;
  });
}

async function configureClientSelection(form) {
  const clientSection = getClientSection(form);
  let clients = [];

  clientSection.cancelSelectionButton.addEventListener("click", () => {
    showNewClientFields(clientSection);
  });

  clientSection.useExistingClientButton.addEventListener("click", () => {
    showExistingClientSelect(clientSection);
  });

  clientSection.existingClientSelect.addEventListener("change", () => {
    const selectedClientId = Number(clientSection.existingClientSelect.value);
    const selectedClient = clients.find(
      (client) => client.id === selectedClientId,
    );

    if (!selectedClient) return;

    form.elements["client-name"].value = selectedClient.name;
  });

  try {
    clients = await loadAvailableClients();
    populateClientSelect(clientSection.existingClientSelect, clients);
  } catch (error) {
    console.error("No se han podido cargar los clientes existentes.", error);
    clientSection.useExistingClientButton.disabled = true;
  }
}

function getClientSection(form) {
  const newClientFields = form.querySelector("#new-client-fields");

  return {
    cancelSelectionButton: form.querySelector("#cancel-existing-client"),
    useExistingClientButton: form.querySelector("#use-existing-client"),
    existingClientContainer: form.querySelector("#existing-client-container"),
    existingClientSelect: form.querySelector("#existing-client-select"),
    newClientFields,
    newClientInputs: newClientFields.querySelectorAll("input"),
  };
}

function showNewClientFields(clientSection) {
  clientSection.existingClientContainer.hidden = true;
  clientSection.existingClientSelect.required = false;
  clientSection.existingClientSelect.value = "";
  clientSection.newClientFields.hidden = false;

  clientSection.newClientInputs.forEach((input) => {
    input.disabled = false;
    input.value = "";
  });
}

function showExistingClientSelect(clientSection) {
  clientSection.existingClientContainer.hidden = false;
  clientSection.existingClientSelect.required = true;
  clientSection.newClientFields.hidden = true;

  clientSection.newClientInputs.forEach((input) => {
    input.disabled = true;
  });
}

async function loadAvailableClients() {
  const clients = await getLightClients("clients");

  return clients.filter((client) => client.id && client.name);
}

function populateClientSelect(select, clients) {
  clients.forEach((client) => {
    const option = document.createElement("option");

    option.value = client.id;
    option.textContent = client.name;
    select.append(option);
  });
}
