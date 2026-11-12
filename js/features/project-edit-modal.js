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

export async function createEditModalProject(project, onSave) {
  const overlay = createElement("div", "modal-overlay");
  const modal = createElement("section", "project-edit-modal");
  const clients = await getLightClients("clients");
  const projectFields = createProjectForm(project, clients);

  const title = createElement("h1", "modal-title");
  title.textContent = `Editando proyecto: ${project.name}`;

  const closeButton = createButton("×", "modal-close-button");
  closeButton.addEventListener("click", () => {
    onSave(project);
    overlay.remove();
  });

  const saveButton = createButton("Guardar", "modal-save-button");
  saveButton.addEventListener("click", async () => {
    await saveProject(project, projectFields, clients, onSave, overlay);
  });

  const cancelButton = createButton("Cancelar", "modal-cancel-button");
  cancelButton.addEventListener("click", () => overlay.remove());

  const modalActions = createElement("div", "modal-actions");
  modalActions.append(saveButton, cancelButton);

  modal.append(
    closeButton,
    title,
    createProjectField("Nombre del proyecto", projectFields.name),
    createProjectField("Descripción", projectFields.description),
    createProjectField("Cliente", projectFields.client),
    createStatusField(projectFields.status),
    ...buildProjectSections(project),
    modalActions,
  );
  overlay.append(modal);

  return overlay;
}

async function saveProject(project, fields, clients, onSave, overlay) {
  try {
    await updateProjectChanges(project, fields, clients);
    await onSave(project);
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

async function updateProjectChanges(project, fields, clients) {
  project.name = fields.name.value.trim();
  project.description = fields.description.value.trim();
  project.client_id = Number(fields.client.value);

  await updateProjectStatus(project, fields.status.value === "true");

  project.client = clients.find((client) => client.id === project.client_id);
  await modifyProject(project, project.id);
}

async function updateProjectStatus(project, isActive) {
  if (project.is_active === isActive) return;

  if (isActive) {
    await restoreProject(project.id);
  } else {
    await archiveProject(project.id);
  }

  project.is_active = isActive;
}

function createProjectForm(project, clients) {
  const name = createInput("text", project.name, "name");
  const description = createInput(
    "text",
    project.description,
    "description",
    "Descripción del proyecto",
  );
  const client = createSelect(
    clients.map(({ id, name: clientName }) => [id, clientName]),
    project.client_id,
    "client_id",
  );
  const status = createSelect(
    [
      ["true", "Activo"],
      ["false", "Inactivo"],
    ],
    project.is_active,
    "is_active",
  );

  return { name, description, client, status };
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
  const section = document.createElement("section");
  const title = createTextElement("h3", sectionOptions.title);
  const list = document.createElement("ul");
  const addButton = createButton(sectionOptions.addLabel, "modal-add-button");

  addButton.addEventListener("click", () => {
    const listItem = document.createElement("li");
    list.append(listItem);
    renderItemEditor(
      listItem,
      sectionOptions.createEmptyItem(),
      sectionOptions,
      true,
    );
  });

  sectionOptions.list.forEach((item) => {
    const listItem = document.createElement("li");
    renderItemReadView(listItem, item, sectionOptions);
    list.append(listItem);
  });

  section.append(title, list, addButton);
  return section;
}

function renderItemEditor(listItem, item, sectionOptions, isNew = false) {
  const { inputElements, getChanges } =
    sectionOptions.createEditorSections(item);
  const saveButton = createButton("Guardar", "modal-save-button");
  const cancelButton = createButton("Cancelar");

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderItemReadView(listItem, item, sectionOptions);
  });

  saveButton.addEventListener("click", async () => {
    await saveListItem(async () => {
      const updatedItem = { ...item, ...getChanges() };
      const savedItem = await updateListItem(
        item,
        updatedItem,
        sectionOptions,
        isNew,
      );
      renderItemReadView(listItem, savedItem, sectionOptions);
    }, sectionOptions.itemName);
  });

  listItem.replaceChildren(...inputElements, saveButton, cancelButton);
}

function renderItemReadView(listItem, item, sectionOptions) {
  const editButton = createButton("Editar");
  editButton.addEventListener("click", () => {
    renderItemEditor(listItem, item, sectionOptions);
  });

  const deleteButton = createDeleteButton(
    sectionOptions.list,
    item,
    listItem,
    sectionOptions.deleteItem,
  );
  listItem.replaceChildren(
    sectionOptions.createReadContent(item),
    editButton,
    deleteButton,
  );
}

async function updateListItem(item, updatedItem, sectionOptions, isNew) {
  if (isNew) {
    const createdItem = await sectionOptions.createItem(updatedItem);
    sectionOptions.list.push(createdItem);
    return createdItem;
  }

  await sectionOptions.updateItem(updatedItem, updatedItem.id);
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

function createDeleteButton(list, item, listItem, deleteItem) {
  const deleteButton = createButton("Eliminar");
  deleteButton.addEventListener("click", async () => {
    await deleteItem(item.id);

    const itemIndex = list.indexOf(item);
    if (itemIndex !== -1) list.splice(itemIndex, 1);

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
