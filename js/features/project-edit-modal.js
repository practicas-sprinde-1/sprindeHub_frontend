import { getLightClients } from "../api/client.api.js";
import {
  deleteCommand,
  modifyCommand,
  setCommand,
} from "../api/command.api.js";
import { deleteDomain, modifyDomain, setDomain } from "../api/domain.api.js";
import {
  deleteEnvironment,
  modifyEnvironment,
  setEnvironment,
} from "../api/environment.api.js";
import { deleteLink, modifyLink, setLink } from "../api/link.api.js";
import { deleteNote, modifyNote, setNote } from "../api/note.api.js";
import {
  archiveProject,
  modifyProject,
  restoreProject,
} from "../api/project.api.js";
import {
  deleteRepository,
  modifyRepository,
  setRepository,
} from "../api/repository.api.js";
import {
  deleteService,
  modifyService,
  setService,
} from "../api/service.api.js";
import { showNotification } from "../components/notifications.js";

const SAVE_ERROR_DURATION = 7000;

//Se utiliza un array de tuplas [valor, etiqueta] en lugar de un objeto para
// facilitar la iteración y desestructuración directa al crear los <option> en createSelect().
const ENVIRONMENT_TYPES = [
  ["development", "Development"],
  ["test", "Test"],
  ["staging", "Staging"],
  ["production", "Production"],
];

const REPOSITORY_TYPES = [
  ["backend", "Backend"],
  ["frontend", "Frontend"],
  ["devops", "Devops"],
  ["qa", "QA"],
];

export async function createEditModalProject(project, onSaveSuccess) {
  const overlay = createElement("div", "modal-overlay");
  const modal = createElement("section", "project-edit-modal");
  const clients = await getLightClients("clients");
  const projectForm = createProjectForm(project, clients);
  const projectSections = buildProjectSections(project);

  const closeModal = async () => {
    overlay.remove();

    const hasSavedChanges =
      projectForm.hasSavedChanges ||
      projectSections.some((section) => section.hasSavedChanges);
    if (!hasSavedChanges) {
      return;
    }

    try {
      await onSaveSuccess(project);
    } catch (error) {
      showNotification({
        type: "error",
        title: "No se ha podido actualizar el proyecto",
        message: error.message,
        duration: SAVE_ERROR_DURATION,
      });
    }
  };

  const title = createElement("h1", "modal-title");
  title.textContent = `Editando proyecto: ${project.name}`;

  const closeButton = createButton("×", "modal-close-button");
  closeButton.addEventListener("click", closeModal);

  const saveButton = createButton("Guardar", "modal-save-button");
  saveButton.addEventListener("click", async () => {
    await saveProject(project, projectForm, clients, onSaveSuccess, overlay);
  });

  const cancelButton = createButton("Cancelar", "modal-cancel-button");
  cancelButton.addEventListener("click", closeModal);

  const modalActions = createElement("div", "modal-actions");
  modalActions.append(saveButton, cancelButton);

  modal.append(
    closeButton,
    title,
    createProjectField("Nombre del proyecto", projectForm.name),
    createProjectField("Descripción", projectForm.description),
    createProjectField("Cliente", projectForm.client),
    createStatusField(projectForm.status),
    ...projectSections.map((section) => section.element),
    modalActions,
  );
  overlay.append(modal);

  return overlay;
}

async function saveProject(
  project,
  projectForm,
  clients,
  onSaveSuccess,
  overlay,
) {
  try {
    await updateProjectChanges(project, projectForm, clients);
    await onSaveSuccess(project);
    overlay.remove();
    showNotification({
      type: "success",
      title: "Proyecto modificado",
      message: "Los cambios se han guardado correctamente.",
    });
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se ha podido modificar el proyecto",
      message: error.message,
      duration: SAVE_ERROR_DURATION,
    });
  }
}

async function updateProjectChanges(project, projectForm, clients) {
  const selectedClientValue = projectForm.client.value;
  const selectedClientId =
    selectedClientValue === "" ? null : Number(selectedClientValue);
  const hasClientChanged = selectedClientId !== project.client_id;
  const projectChanges = {
    name: projectForm.name.value.trim(),
    description: projectForm.description.value.trim(),
  };

  // La API solo admite clientes activos al cambiar la asignación.
  if (hasClientChanged) {
    projectChanges.client_id = selectedClientId;
  }

  await updateProjectStatus(project, projectForm);
  await modifyProject(projectChanges, project.id);
  Object.assign(project, projectChanges);
  projectForm.hasSavedChanges = true;

  if (!hasClientChanged) {
    return;
  }

  project.client = clients.find((client) => client.id === selectedClientId) ?? null;
}

async function updateProjectStatus(project, projectForm) {
  const isActive = projectForm.status.value === "true";
  if (project.is_active === isActive) {
    return;
  }

  if (isActive) {
    await restoreProject(project.id);
  } else {
    await archiveProject(project.id);
  }

  project.is_active = isActive;
  // El estado se guarda antes de enviar los demás campos del formulario.
  projectForm.hasSavedChanges = true;
}

function createProjectForm(project, clients) {
  const name = createInput("text", project.name, "name");
  const description = createInput(
    "text",
    project.description,
    "description",
    "Descripción del proyecto",
  );
  const currentClientId = project.client_id;
  const selectedClientValue = currentClientId ?? "";
  const clientOptions = [];

  const isCurrentClientListed = clients.some((client) => {
    return client.id === currentClientId;
  });

  // Añade primero el cliente archivado o la opción «No asignado».
  if (!isCurrentClientListed) {
    const currentClientName = project.client?.name ?? "No asignado";
    clientOptions.push([selectedClientValue, currentClientName]);
  }

  for (const client of clients) {
    clientOptions.push([client.id, client.name]);
  }

  const client = createSelect(clientOptions, selectedClientValue, "client_id");
  const status = createSelect(
    [
      ["true", "Activo"],
      ["false", "Inactivo"],
    ],
    project.is_active,
    "is_active",
  );

  return { name, description, client, status, hasSavedChanges: false };
}

function createProjectField(labelText, inputElement) {
  const field = createElement("div", "project-edit-field");
  field.append(createLabel(labelText, inputElement), inputElement);
  return field;
}

function createStatusField(statusSelect) {
  const field = createElement("div", "project-edit-field");
  const statusContainer = createElement("div", "project-status-container");
  const indicator = createElement("span", "project-status-indicator");

  const updateIndicator = () => {
    const isActive = statusSelect.value === "true";
    indicator.classList.toggle("project-status-indicator--active", isActive);
    indicator.classList.toggle("project-status-indicator--inactive", !isActive);
  };

  statusSelect.addEventListener("change", updateIndicator);
  updateIndicator();
  statusContainer.append(indicator, statusSelect);
  field.append(createLabel("Estado", statusSelect), statusContainer);
  return field;
}

function buildProjectSections(project) {
  return [
    createTypedUrlSection({
      title: "Entornos",
      addLabel: "Añadir entorno",
      itemName: "entorno",
      list: project.environments,
      projectId: project.id,
      typeOptions: ENVIRONMENT_TYPES,
      createItem: setEnvironment,
      updateItem: modifyEnvironment,
      deleteItem: deleteEnvironment,
    }),
    createTypedUrlSection({
      title: "Repositorios",
      addLabel: "Añadir repositorio",
      itemName: "repositorio",
      list: project.repositories,
      projectId: project.id,
      typeOptions: REPOSITORY_TYPES,
      createItem: setRepository,
      updateItem: modifyRepository,
      deleteItem: deleteRepository,
    }),
    createServiceSection(project.services, project.id),
    createDomainSection(project.domains, project.id),
    createCommandSection(project.commands, project.id),
    createLinkSection(project.links, project.id),
    createNoteSection(project.notes, project.id),
  ];
}

function createTypedUrlSection(sectionOptions) {
  const {
    title,
    addLabel,
    itemName,
    list,
    projectId,
    typeOptions,
    createItem,
    updateItem,
    deleteItem,
  } = sectionOptions;

  return createEditableListSection({
    title,
    addLabel,
    itemName,
    list,
    createEmptyItem: () => ({ type: "", url: "", project_id: projectId }),
    createItem,
    updateItem,
    deleteItem,
    createEditorSections: (item) => {
      const type = createSelect(typeOptions, item.type || typeOptions[0][0]);
      type.name = "type";
      const url = createInput("url", item.url, "", "Introduce una url válida");
      return {
        inputElements: [type, url],
        getChanges: () => ({
          type: type.value.trim(),
          url: url.value.trim(),
        }),
      };
    },
    createReadContent: (item) =>
      createExternalLink(item.url, `${item.type}: ${item.url}`),
  });
}

function createServiceSection(services, projectId) {
  return createEditableListSection({
    title: "Servicios",
    addLabel: "Añadir servicio",
    itemName: "servicio",
    list: services,
    createEmptyItem: () => ({ project_id: projectId, name: "" }),
    createItem: setService,
    updateItem: modifyService,
    deleteItem: deleteService,
    createEditorSections: (service) => {
      const name = createInput("text", service.name, "", "Nombre del servicio");
      return {
        inputElements: [name],
        getChanges: () => ({ name: name.value.trim() }),
      };
    },
    createReadContent: (service) => createTextElement("span", service.name),
  });
}

function createDomainSection(domains, projectId) {
  return createEditableListSection({
    title: "Dominios",
    addLabel: "Añadir dominio",
    itemName: "dominio",
    list: domains,
    createEmptyItem: () => ({ project_id: projectId, url: "" }),
    createItem: setDomain,
    updateItem: modifyDomain,
    deleteItem: deleteDomain,
    createEditorSections: (domain) => {
      const url = createInput("url", domain.url, "", "URL del dominio");
      return {
        inputElements: [url],
        getChanges: () => ({ url: url.value.trim() }),
      };
    },
    createReadContent: (domain) => createExternalLink(domain.url, domain.url),
  });
}

function createCommandSection(commands, projectId) {
  return createEditableListSection({
    title: "Comandos",
    addLabel: "Añadir comando",
    itemName: "comando",
    list: commands,
    createEmptyItem: () => ({
      project_id: projectId,
      name: "",
      instruction: "",
    }),
    createItem: setCommand,
    updateItem: modifyCommand,
    deleteItem: deleteCommand,
    createEditorSections: (command) => {
      const name = createInput("text", command.name, "", "Nombre del comando");
      const instruction = createInput(
        "text",
        command.instruction,
        "",
        "Instrucción",
      );
      return {
        inputElements: [name, instruction],
        getChanges: () => ({
          name: name.value.trim(),
          instruction: instruction.value.trim(),
        }),
      };
    },
    createReadContent: (command) =>
      createContentGroup([
        createTextElement("strong", command.name),
        createTextElement("code", command.instruction),
      ]),
  });
}

function createLinkSection(links, projectId) {
  return createEditableListSection({
    title: "Documentación",
    addLabel: "Añadir documentación",
    itemName: "documentación",
    list: links,
    createEmptyItem: () => ({ project_id: projectId, title: "", url: "" }),
    createItem: setLink,
    updateItem: modifyLink,
    deleteItem: deleteLink,
    createEditorSections: (link) => {
      const title = createInput("text", link.title, "", "Título");
      const url = createInput("url", link.url, "", "URL de documentación");
      return {
        inputElements: [title, url],
        getChanges: () => ({
          title: title.value.trim(),
          url: url.value.trim(),
        }),
      };
    },
    createReadContent: (link) =>
      createContentGroup([
        createTextElement("strong", link.title),
        createExternalLink(link.url, link.url),
      ]),
  });
}

function createNoteSection(notes, projectId) {
  return createEditableListSection({
    title: "Notas",
    addLabel: "Añadir nota",
    itemName: "nota",
    list: notes,
    createEmptyItem: () => ({
      project_id: projectId,
      description: "",
      content: "",
    }),
    createItem: setNote,
    updateItem: modifyNote,
    deleteItem: deleteNote,
    createEditorSections: (note) => {
      const description = createInput(
        "text",
        note.description,
        "",
        "Título de la nota",
      );
      const content = document.createElement("textarea");
      content.value = note.content;
      content.placeholder = "Contenido de la nota";
      content.rows = 4;
      return {
        inputElements: [description, content],
        getChanges: () => ({
          description: description.value.trim(),
          content: content.value.trim(),
        }),
      };
    },
    createReadContent: (note) =>
      createContentGroup([
        createTextElement("strong", note.description),
        createTextElement("p", note.content),
      ]),
  });
}

function createEditableListSection(sectionOptions) {
  const element = document.createElement("section");
  const editableSection = {
    ...sectionOptions,
    element,
    hasSavedChanges: false,
  };
  const title = createTextElement("h3", sectionOptions.title);
  const list = document.createElement("ul");
  const addButton = createButton(sectionOptions.addLabel, "modal-add-button");

  addButton.addEventListener("click", () => {
    const listItem = document.createElement("li");
    list.append(listItem);
    renderItemEditor(
      listItem,
      editableSection.createEmptyItem(),
      editableSection,
      true,
    );
  });

  editableSection.list.forEach((item) => {
    const listItem = document.createElement("li");
    renderItemReadView(listItem, item, editableSection);
    list.append(listItem);
  });

  element.append(title, list, addButton);
  return editableSection;
}

function renderItemEditor(listItem, item, editableSection, isNew = false) {
  const { inputElements, getChanges } =
    editableSection.createEditorSections(item);
  const saveButton = createButton("Guardar", "modal-save-button");
  const cancelButton = createButton("Cancelar");

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderItemReadView(listItem, item, editableSection);
  });

  saveButton.addEventListener("click", async () => {
    await saveListItem(async () => {
      const updatedItem = { ...item, ...getChanges() };
      const savedItem = await updateListItem(
        item,
        updatedItem,
        editableSection,
        isNew,
      );
      editableSection.hasSavedChanges = true;
      renderItemReadView(listItem, savedItem, editableSection);
    }, editableSection.itemName);
  });

  listItem.replaceChildren(...inputElements, saveButton, cancelButton);
}

function renderItemReadView(listItem, item, editableSection) {
  const editButton = createButton("Editar");
  editButton.addEventListener("click", () => {
    renderItemEditor(listItem, item, editableSection);
  });

  const deleteButton = createDeleteButton(listItem, item, editableSection);
  listItem.replaceChildren(
    editableSection.createReadContent(item),
    editButton,
    deleteButton,
  );
}

async function updateListItem(item, updatedItem, editableSection, isNew) {
  if (isNew) {
    const createdItem = await editableSection.createItem(updatedItem);
    editableSection.list.push(createdItem);
    return createdItem;
  }

  await editableSection.updateItem(updatedItem, updatedItem.id);
  Object.assign(item, updatedItem);
  return item;
}

async function saveListItem(saveItem, itemName) {
  try {
    await saveItem();
  } catch (error) {
    showNotification({
      type: "error",
      title: `No se ha podido guardar el ${itemName}`,
      message: error.message,
      duration: SAVE_ERROR_DURATION,
    });
  }
}

function createDeleteButton(listItem, item, editableSection) {
  const deleteButton = createButton("Eliminar");
  deleteButton.addEventListener("click", async () => {
    await editableSection.deleteItem(item.id);

    const itemIndex = editableSection.list.indexOf(item);
    if (itemIndex !== -1) {
      editableSection.list.splice(itemIndex, 1);
    }

    editableSection.hasSavedChanges = true;
    listItem.remove();
  });
  return deleteButton;
}

function createElement(tagName, className) {
  const element = document.createElement(tagName);
  if (className) element.classList.add(className);
  return element;
}

function createTextElement(tagName, text) {
  const element = document.createElement(tagName);
  element.textContent = text;
  return element;
}

function createContentGroup(children) {
  const content = document.createElement("div");
  content.append(...children);
  return content;
}

function createButton(text, className) {
  const button = createElement("button", className);
  button.type = "button";
  button.textContent = text;
  return button;
}

function createInput(type, value, name = "", placeholder = "") {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  input.name = name;
  input.placeholder = placeholder;
  return input;
}

function createSelect(options, selectedValue, name = "") {
  const select = document.createElement("select");
  select.name = name;
  options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  });
  select.value = selectedValue;
  return select;
}

function createLabel(text, input) {
  const label = document.createElement("label");
  input.id = input.name;
  label.htmlFor = input.name;
  label.textContent = text;
  return label;
}

function createExternalLink(url, text) {
  const link = document.createElement("a");
  link.href = url;
  link.textContent = text;
  link.target = "_blank"; //Nueva pestaña
  link.rel = "noreferrer"; //Oculta el rastro de origen
  return link;
}
