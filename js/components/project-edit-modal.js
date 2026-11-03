import { getLightClients } from "../api/client.api.js";
import {
  deleteEnvironment,
  modifyEnvironment,
  setEnvironment,
} from "../api/environment.api.js";
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
import { deleteDomain, modifyDomain, setDomain } from "../api/domain.api.js";
import {
  deleteCommand,
  modifyCommand,
  setCommand,
} from "../api/command.api.js";
import { deleteLink, modifyLink, setLink } from "../api/link.api.js";
import { deleteNote, modifyNote, setNote } from "../api/note.api.js";
import {
  archiveProject,
  modifyProject,
  restoreProject,
} from "../api/project.api.js";
import { showNotification } from "./notifications.js";

export async function createEditModalProject(project, onSave) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("project-edit-modal");

  const title = document.createElement("h1");
  title.textContent = `Editando proyecto: ${project.name}`;
  title.classList.add("modal-title");

  const closeButton = document.createElement("button");
  closeButton.classList.add("modal-close-button");
  closeButton.type = "button";
  closeButton.textContent = "×";

  closeButton.addEventListener("click", () => {
    onSave(project);
    overlay.remove();
  });

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  saveButton.addEventListener("click", async () => {
    try {
      await saveProjectChanges(project, fields, clients);

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
        duration: 7000,
      });
    }
  });

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";
  cancelButton.classList.add("modal-cancel-button");

  cancelButton.addEventListener("click", () => {
    overlay.remove();
  });

  const clients = await getLightClients("clients");
  const fields = createProjectForm(project, clients);

  const environmentsSection = createEnvironmentsSection(
    project.environments,
    project.id,
  );
  const repositoriesSection = createRepositoriesSection(
    project.repositories,
    project.id,
  );
  const servicesSection = createServicesSection(project.services, project.id);
  const domainsSection = createDomainsSection(project.domains, project.id);
  const commandsSection = createCommandsSection(project.commands, project.id);
  const linksSection = createLinksSection(project.links, project.id);
  const notesSection = createNotesSection(project.notes, project.id);

  const modalActions = document.createElement("div");
  modalActions.classList.add("modal-actions");
  modalActions.append(saveButton, cancelButton);

  modal.append(
    closeButton,
    title,
    createProjectField("Nombre del proyecto", fields.projectName),
    createProjectField("Descripción", fields.projectDescription),
    createProjectField("Cliente", fields.clientSelect),
    createStatusField(fields.statusSelect),
    environmentsSection,
    repositoriesSection,
    servicesSection,
    domainsSection,
    commandsSection,
    linksSection,
    notesSection,
    modalActions,
  );

  overlay.append(modal);

  return overlay;
}

async function saveProjectChanges(project, fields, clients) {
  project.name = fields.projectName.value.trim();
  project.description = fields.projectDescription.value.trim();
  project.client_id = Number(fields.clientSelect.value);

  await updateProjectStatus(project, fields.statusSelect.value === "true");

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
  const projectName = document.createElement("input");
  projectName.type = "text";
  projectName.name = "name";
  projectName.value = project.name;

  const projectDescription = document.createElement("input");
  projectDescription.type = "text";
  projectDescription.name = "description";
  projectDescription.value = project.description;
  projectDescription.placeholder = "Descripción del proyecto";

  const clientSelect = document.createElement("select");
  clientSelect.name = "client_id";

  clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.name;
    clientSelect.append(option);
  });

  clientSelect.value = project.client_id;

  const statusSelect = document.createElement("select");
  statusSelect.name = "is_active";

  const activeOption = document.createElement("option");
  activeOption.value = "true";
  activeOption.textContent = "Activo";
  const inactiveOption = document.createElement("option");
  inactiveOption.value = "false";
  inactiveOption.textContent = "Inactivo";

  statusSelect.append(activeOption, inactiveOption);
  statusSelect.value = project.is_active;

  return { projectName, projectDescription, clientSelect, statusSelect };
}

function createProjectField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("project-edit-field");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.name;
  input.id = input.name;

  field.append(label, input);
  return field;
}

function createStatusField(statusSelect) {
  const field = document.createElement("div");
  field.classList.add("project-edit-field");

  const label = document.createElement("label");
  label.textContent = "Estado";
  label.htmlFor = statusSelect.name;
  statusSelect.id = statusSelect.name;

  const control = document.createElement("div");
  control.classList.add("project-status-control");

  const indicator = document.createElement("span");
  indicator.classList.add("project-status-indicator");

  const updateIndicator = () => {
    const isActive = statusSelect.value === "true";
    indicator.classList.toggle("project-status-indicator--active", isActive);
    indicator.classList.toggle("project-status-indicator--inactive", !isActive);
  };

  statusSelect.addEventListener("change", updateIndicator);
  updateIndicator();

  control.append(indicator, statusSelect);
  field.append(label, control);
  return field;
}

function createEnvironmentsSection(environments, projectId) {
  return createCollectionSection({
    title: "Entornos",
    addLabel: "Añadir entorno",
    collection: environments,
    createItem: () => ({
      type: "",
      url: "",
      project_id: projectId,
    }),
    renderItem: renderEnvironmentRead,
    editItem: createEnvironmentsEdit,
  });
}

function createEnvironmentsEdit(
  listItem,
  environment,
  environments,
  isNew = false,
) {
  listItem.replaceChildren();

  const typeSelect = document.createElement("select");
  typeSelect.name = "type";

  const optionDev = document.createElement("option");
  const optionTest = document.createElement("option");
  const optionStaging = document.createElement("option");
  const optionProd = document.createElement("option");

  optionDev.textContent = "Development";
  optionDev.value = "development";
  optionTest.textContent = "Test";
  optionTest.value = "test";
  optionStaging.textContent = "Staging";
  optionStaging.value = "staging";
  optionProd.textContent = "Production";
  optionProd.value = "production";

  typeSelect.append(optionDev, optionTest, optionStaging, optionProd);

  typeSelect.value = environment.type === "" ? optionDev.value : environment.type;

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.value = environment.url;
  urlInput.placeholder = "Introduce una url válida";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderEnvironmentRead(listItem, environment, environments);
  });

  saveButton.addEventListener("click", async () => {
    const updatedEnvironment = {
      ...environment,
      type: typeSelect.value.trim(),
      url: urlInput.value.trim(),
    };

    await saveChildItem(async () => {
      const savedItem = await persistChildItem({
        item: environment,
        updatedItem: updatedEnvironment,
        collection: environments,
        isNew,
        createItem: setEnvironment,
        updateItem: modifyEnvironment,
      });
      renderEnvironmentRead(listItem, savedItem, environments);
    }, "entorno");
  });

  listItem.append(typeSelect, urlInput, saveButton, cancelButton);
}

function renderEnvironmentRead(listItem, environment, environments) {
  listItem.replaceChildren();

  const link = document.createElement("a");
  link.href = environment.url;
  link.textContent = `${environment.type}: ${environment.url}`;
  link.target = "_blank";
  link.rel = "noreferrer";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", () => {
    createEnvironmentsEdit(listItem, environment, environments);
  });

  listItem.append(
    link,
    editButton,
    createDeleteButton(environments, environment, listItem, deleteEnvironment),
  );
}


function createRepositoriesSection(repositories, projectId) {
  return createCollectionSection({
    title: "Repositorios",
    addLabel: "Añadir repositorio",
    collection: repositories,
    createItem: () => ({ project_id: projectId, type: "", url: "" }),
    renderItem: renderRepositoryRead,
    editItem: createRepositoryEdit,
  });
}

function createRepositoryEdit(
  listItem,
  repository,
  repositories,
  isNew = false,
) {
  listItem.replaceChildren();

  const typeSelect = document.createElement("select");
  typeSelect.name = "type";

  const optionBack = document.createElement("option");
  const optionFront = document.createElement("option");
  const optionDevOps = document.createElement("option");
  const optionQa = document.createElement("option");

  optionBack.textContent = "Backend";
  optionBack.value = "backend";
  optionFront.textContent = "Frontend";
  optionFront.value = "frontend";
  optionDevOps.textContent = "Devops";
  optionDevOps.value = "devops";
  optionQa.textContent = "QA";
  optionQa.value = "qa";

  typeSelect.append(optionBack, optionFront, optionDevOps, optionQa);

  typeSelect.value = repository.type === "" ? optionBack.value : repository.type;

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.value = repository.url;
  urlInput.placeholder = "Introduce una url válida";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderRepositoryRead(listItem, repository, repositories);
  });

  saveButton.addEventListener("click", async () => {
    const updatedRepository = {
      ...repository,
      type: typeSelect.value.trim(),
      url: urlInput.value.trim(),
    };

    await saveChildItem(async () => {
      const savedItem = await persistChildItem({
        item: repository,
        updatedItem: updatedRepository,
        collection: repositories,
        isNew,
        createItem: setRepository,
        updateItem: modifyRepository,
      });
      renderRepositoryRead(listItem, savedItem, repositories);
    }, "repositorio");
  });

  listItem.append(typeSelect, urlInput, saveButton, cancelButton);
}

function renderRepositoryRead(listItem, repository, repositories) {
  listItem.replaceChildren();

  const link = document.createElement("a");
  link.href = repository.url;
  link.textContent = `${repository.type}: ${repository.url}`;
  link.target = "_blank";
  link.rel = "noreferrer";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", () => {
    createRepositoryEdit(listItem, repository, repositories);
  });

  listItem.append(
    link,
    editButton,
    createDeleteButton(repositories, repository, listItem, deleteRepository),
  );
}


function createServicesSection(services, projectId) {
  return createCollectionSection({
    title: "Servicios",
    addLabel: "Añadir servicio",
    collection: services,
    createItem: () => ({ project_id: projectId, name: "" }),
    renderItem: renderServiceRead,
    editItem: createServiceEdit,
  });
}

function createServiceEdit(listItem, service, services, isNew = false) {
  listItem.replaceChildren();

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = service.name;
  nameInput.placeholder = "Nombre del servicio";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderServiceRead(listItem, service, services);
  });

  saveButton.addEventListener("click", async () => {
    const updatedService = {
      ...service,
      name: nameInput.value.trim(),
    };

    await saveChildItem(async () => {
      const savedItem = await persistChildItem({
        item: service,
        updatedItem: updatedService,
        collection: services,
        isNew,
        createItem: setService,
        updateItem: modifyService,
      });
      renderServiceRead(listItem, savedItem, services);
    }, "servicio");
  });

  listItem.append(nameInput, saveButton, cancelButton);
}

function renderServiceRead(listItem, service, services) {
  listItem.replaceChildren();

  const name = document.createElement("span");
  name.textContent = service.name;

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", () => {
    createServiceEdit(listItem, service, services);
  });

  listItem.append(
    name,
    editButton,
    createDeleteButton(services, service, listItem, deleteService),
  );
}


function createDomainsSection(domains, projectId) {
  return createCollectionSection({
    title: "Dominios",
    addLabel: "Añadir dominio",
    collection: domains,
    createItem: () => ({ project_id: projectId, url: "" }),
    renderItem: renderDomainRead,
    editItem: createDomainEdit,
  });
}

function createDomainEdit(listItem, domain, domains, isNew = false) {
  listItem.replaceChildren();

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.value = domain.url;
  urlInput.placeholder = "URL del dominio";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderDomainRead(listItem, domain, domains);
  });

  saveButton.addEventListener("click", async () => {
    const updatedDomain = {
      ...domain,
      url: urlInput.value.trim(),
    };

    await saveChildItem(async () => {
      const savedItem = await persistChildItem({
        item: domain,
        updatedItem: updatedDomain,
        collection: domains,
        isNew,
        createItem: setDomain,
        updateItem: modifyDomain,
      });
      renderDomainRead(listItem, savedItem, domains);
    }, "dominio");
  });

  listItem.append(urlInput, saveButton, cancelButton);
}

function renderDomainRead(listItem, domain, domains) {
  listItem.replaceChildren();

  const link = document.createElement("a");
  link.href = domain.url;
  link.textContent = domain.url;
  link.target = "_blank";
  link.rel = "noreferrer";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", () => {
    createDomainEdit(listItem, domain, domains);
  });

  listItem.append(
    link,
    editButton,
    createDeleteButton(domains, domain, listItem, deleteDomain),
  );
}


function createCommandsSection(commands, projectId) {
  return createCollectionSection({
    title: "Comandos",
    addLabel: "Añadir comando",
    collection: commands,
    createItem: () => ({ project_id: projectId, name: "", instruction: "" }),
    renderItem: renderCommandRead,
    editItem: createCommandEdit,
  });
}

function createCommandEdit(listItem, command, commands, isNew = false) {
  listItem.replaceChildren();

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = command.name;
  nameInput.placeholder = "Nombre del comando";

  const instructionInput = document.createElement("input");
  instructionInput.type = "text";
  instructionInput.value = command.instruction;
  instructionInput.placeholder = "Instrucción";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderCommandRead(listItem, command, commands);
  });

  saveButton.addEventListener("click", async () => {
    const updatedCommand = {
      ...command,
      name: nameInput.value.trim(),
      instruction: instructionInput.value.trim(),
    };

    await saveChildItem(async () => {
      const savedItem = await persistChildItem({
        item: command,
        updatedItem: updatedCommand,
        collection: commands,
        isNew,
        createItem: setCommand,
        updateItem: modifyCommand,
      });
      renderCommandRead(listItem, savedItem, commands);
    }, "comando");
  });

  listItem.append(nameInput, instructionInput, saveButton, cancelButton);
}

function renderCommandRead(listItem, command, commands) {
  listItem.replaceChildren();

  const content = document.createElement("div");
  const name = document.createElement("strong");
  const instruction = document.createElement("code");

  name.textContent = command.name;
  instruction.textContent = command.instruction;
  content.append(name, instruction);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", () => {
    createCommandEdit(listItem, command, commands);
  });

  listItem.append(
    content,
    editButton,
    createDeleteButton(commands, command, listItem, deleteCommand),
  );
}


function createLinksSection(links, projectId) {
  return createCollectionSection({
    title: "Documentación",
    addLabel: "Añadir documentación",
    collection: links,
    createItem: () => ({ project_id: projectId, title: "", url: "" }),
    renderItem: renderLinkRead,
    editItem: createLinkEdit,
  });
}

function createLinkEdit(listItem, linkData, links, isNew = false) {
  listItem.replaceChildren();

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = linkData.title;
  titleInput.placeholder = "Título";

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.value = linkData.url;
  urlInput.placeholder = "URL de documentación";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderLinkRead(listItem, linkData, links);
  });

  saveButton.addEventListener("click", async () => {
    const updatedLink = {
      ...linkData,
      title: titleInput.value.trim(),
      url: urlInput.value.trim(),
    };

    await saveChildItem(async () => {
      const savedItem = await persistChildItem({
        item: linkData,
        updatedItem: updatedLink,
        collection: links,
        isNew,
        createItem: setLink,
        updateItem: modifyLink,
      });
      renderLinkRead(listItem, savedItem, links);
    }, "documentación");
  });

  listItem.append(titleInput, urlInput, saveButton, cancelButton);
}

function renderLinkRead(listItem, linkData, links) {
  listItem.replaceChildren();

  const content = document.createElement("div");
  const title = document.createElement("strong");
  const link = document.createElement("a");

  title.textContent = linkData.title;
  link.href = linkData.url;
  link.textContent = linkData.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  content.append(title, link);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", () => {
    createLinkEdit(listItem, linkData, links);
  });

  listItem.append(
    content,
    editButton,
    createDeleteButton(links, linkData, listItem, deleteLink),
  );
}


function createNotesSection(notes, projectId) {
  return createCollectionSection({
    title: "Notas",
    addLabel: "Añadir nota",
    collection: notes,
    createItem: () => ({ project_id: projectId, description: "", content: "" }),
    renderItem: renderNoteRead,
    editItem: createNoteEdit,
  });
}

function createNoteEdit(listItem, note, notes, isNew = false) {
  listItem.replaceChildren();

  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.value = note.description;
  descriptionInput.placeholder = "Título de la nota";

  const contentInput = document.createElement("textarea");
  contentInput.value = note.content;
  contentInput.placeholder = "Contenido de la nota";
  contentInput.rows = 4;

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";

  cancelButton.addEventListener("click", () => {
    if (isNew) {
      listItem.remove();
      return;
    }
    renderNoteRead(listItem, note, notes);
  });

  saveButton.addEventListener("click", async () => {
    const updatedNote = {
      ...note,
      description: descriptionInput.value.trim(),
      content: contentInput.value.trim(),
    };

    await saveChildItem(async () => {
      const savedItem = await persistChildItem({
        item: note,
        updatedItem: updatedNote,
        collection: notes,
        isNew,
        createItem: setNote,
        updateItem: modifyNote,
      });
      renderNoteRead(listItem, savedItem, notes);
    }, "nota");
  });

  listItem.append(descriptionInput, contentInput, saveButton, cancelButton);
}

function renderNoteRead(listItem, note, notes) {
  listItem.replaceChildren();

  const content = document.createElement("div");
  const description = document.createElement("strong");
  const noteContent = document.createElement("p");

  description.textContent = note.description;
  noteContent.textContent = note.content;
  content.append(description, noteContent);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", () => {
    createNoteEdit(listItem, note, notes);
  });

  listItem.append(
    content,
    editButton,
    createDeleteButton(notes, note, listItem, deleteNote),
  );
}

function createCollectionSection({
  title: titleText,
  addLabel,
  collection,
  createItem,
  renderItem,
  editItem,
}) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = titleText;
  const list = document.createElement("ul");

  const addButton = createAddButton(addLabel, () => {
    const item = createItem();
    const listItem = document.createElement("li");
    list.append(listItem);
    editItem(listItem, item, collection, true);
  });

  collection.forEach((item) => {
    const listItem = document.createElement("li");
    renderItem(listItem, item, collection);
    list.append(listItem);
  });

  section.append(title, list, addButton);
  return section;
}

async function persistChildItem({
  item,
  updatedItem,
  collection,
  isNew,
  createItem,
  updateItem,
}) {
  if (isNew) {
    const createdItem = await createItem(updatedItem);
    collection.push(createdItem);
    return createdItem;
  }

  await updateItem(updatedItem, updatedItem.id);
  Object.assign(item, updatedItem);
  return item;
}

function createAddButton(text, onClick) {
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.classList.add("modal-add-button");
  addButton.textContent = text;
  addButton.addEventListener("click", onClick);
  return addButton;
}

async function saveChildItem(saveItem, itemName) {
  try {
    await saveItem();
  } catch (error) {
    showNotification({
      type: "error",
      title: `No se ha podido guardar el ${itemName}`,
      message: error.message,
      duration: 7000,
    });
  }
}

function createDeleteButton(collection, item, listItem, deleteItemFromApi) {
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Eliminar";

  deleteButton.addEventListener("click", async () => {
    await deleteItemFromApi(item.id);
    const itemPosition = collection.indexOf(item);

    if (itemPosition !== -1) {
      collection.splice(itemPosition, 1);
    }
    listItem.remove();
  });

  return deleteButton;
}
