import { getClients } from "../api/client.api.js";
import { setFullProject } from "../api/project.api.js";
import { createHeader } from "../components/header.js";

start();

function start() {
  const headerContainer = document.querySelector("#header-container");
  headerContainer.append(createHeader("César", "./profile.html"));

  const projectForm = document.querySelector("#project-form");
  configureProjectForm(projectForm);
}

export function configureProjectForm(form) {
  configureClientSelection(form);

  // Botones que añaden una fila nueva a una colección del formulario.
  const addButtons = form.querySelectorAll('[data-action="add-item"]');

  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Busca la colección a la que pertenece el botón pulsado.
      const fieldset = button.closest("[data-collection]");
      addItem(fieldset);
    });
  });

  form.addEventListener("click", (event) => {
    const removeButton = event.target.closest('[data-action="remove-item"]');

    if (!removeButton) return;

    const item = removeButton.closest(".collection-item");

    item.remove();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedClientId =
      Number(form.elements["existing-client-id"].value) || null;

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

    if (selectedClientId) {
      projectData.client_id = selectedClientId;
    } else {
      projectData.client = {
        name: form.elements["client-name"].value.trim(),
        cif: form.elements.cif.value.trim(),
        phone: form.elements.phone.value.trim(),
      };
    }

    try {
      await setFullProject(projectData);
      window.location.href = "../index.html";
    } catch (error) {
      alert("No se ha podido guardar el proyecto.");
    }
  });
}

function addItem(fieldset) {
  const templateId = fieldset.dataset.template;
  const template = document.querySelector(`#${templateId}`);
  const list = fieldset.querySelector(".collection-list");

  const newItem = template.content.cloneNode(true);

  list.append(newItem);
}

function getCollectionData(form, collectionName) {
  const fieldset = form.querySelector(`[data-collection="${collectionName}"]`);

  const items = fieldset.querySelectorAll(".collection-item");

  // Convierte las filas visibles de una colección en objetos para el proyecto.
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
  const cancelExistingClientButton = form.querySelector(
    "#cancel-existing-client",
  );
  const existingClientButton = form.querySelector("#use-existing-client");
  const existingClientContainer = form.querySelector(
    "#existing-client-container",
  );
  const existingClientSelect = form.querySelector("#existing-client-select");
  const newClientFields = form.querySelector("#new-client-fields");
  const newClientInputs = newClientFields.querySelectorAll("input");

  let clients = [];

  cancelExistingClientButton.addEventListener("click", () => {
    existingClientContainer.hidden = true;
    existingClientSelect.required = false;
    existingClientSelect.value = "";

    newClientFields.hidden = false;

    newClientInputs.forEach((input) => {
      input.disabled = false;
      input.value = "";
    });
  });

  existingClientButton.addEventListener("click", () => {
    existingClientContainer.hidden = false;
    existingClientSelect.required = true;

    newClientFields.hidden = true;

    newClientInputs.forEach((input) => {
      input.disabled = true;
    });
  });

  existingClientSelect.addEventListener("change", () => {
    const selectedClientId = Number(existingClientSelect.value);

    const client = clients.find((client) => {
      return client.id === selectedClientId;
    });

    if (!client) return;

    form.elements["client-name"].value = client.name;
    form.elements.cif.value = client.cif;
    form.elements.phone.value = client.phone;
  });

  try {
    const clientsResponse = await getClients();
    clients = (clientsResponse.items ?? clientsResponse).filter(
      (client) => client.id && client.name,
    );

    clients.forEach((client) => {
      const option = document.createElement("option");

      option.value = client.id;
      option.textContent = client.name;

      existingClientSelect.append(option);
    });
  } catch (error) {
    console.error("No se han podido cargar los clientes existentes.", error);
    existingClientButton.disabled = true;
  }
}
