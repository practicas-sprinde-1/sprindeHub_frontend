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

export async function createEditModalProject(project, onSave) {
  // Reúne en un solo modal las colecciones editables de un proyecto.
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
  closeButton.setAttribute("aria-label", "Cerrar");

  closeButton.addEventListener("click", () => {
    onSave(project);
    overlay.remove();
  });

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  saveButton.addEventListener("click", async () => {
    project.name = projectName.value.trim();
    project.description = projectDescription.value.trim();
    project.client_id = Number(clientSelect.value);

    const previousState = project.is_active;
    let selectedState;

    if (statusSelect.value === "true") {
      selectedState = true;
    } else {
      selectedState = false;
    }

    if (previousState !== selectedState) {
      if (selectedState) {
        await restoreProject(project.id);
      } else {
        await archiveProject(project.id);
      }
      project.is_active = selectedState;
    }

    //Metodo para que aparezca por pantalla el cliente nuevo seleccionado
    project.client = clients.find((client) => client.id === project.client_id);

    await modifyProject(project, project.id);

    await onSave(project);

    overlay.remove();
  });

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";
  cancelButton.classList.add("modal-cancel-button");

  cancelButton.addEventListener("click", () => {
    overlay.remove();
  });

  const projectName = document.createElement("input");
  projectName.type = "text";
  projectName.name = "name";
  projectName.value = project.name;

  const projectDescription = document.createElement("input");
  projectDescription.type = "text";
  projectDescription.name = "description";
  projectDescription.value = project.description;
  projectDescription.placeholder = "Descripción del proyecto";

  const clients = await getLightClients("clients");

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

  const projectNameField = createProjectField(
    "Nombre del proyecto",
    projectName,
  );
  const projectDescriptionField = createProjectField(
    "Descripción",
    projectDescription,
  );
  const clientField = createProjectField("Cliente", clientSelect);
  const statusField = createStatusField(statusSelect);

  const environmentsSection = createEnvironmentsRead(
    project.environments,
    project.id,
  );
  const repositoriesSection = createRepositoriesRead(
    project.repositories,
    project.id,
  );
  const servicesSection = createServicesRead(project.services, project.id);
  const domainsSection = createDomainsRead(project.domains, project.id);
  const commandsSection = createCommandsRead(project.commands, project.id);
  const linksSection = createLinksRead(project.links, project.id);
  const notesSection = createNotesRead(project.notes, project.id);

  // Agrupa las acciones para colocarlas juntas en la primera columna del grid del modal.
  const modalActions = document.createElement("div");
  modalActions.classList.add("modal-actions");
  modalActions.append(saveButton, cancelButton);

  modal.append(
    closeButton,
    title,
    projectNameField,
    projectDescriptionField,
    clientField,
    statusField,
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
  indicator.setAttribute("aria-hidden", "true");

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

function createEnvironmentsRead(environments, projectId) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Entornos";

  const environmentsList = document.createElement("ul");
  const addButton = createAddButton("Añadir entorno", () => {
    const environment = {
      type: "",
      url: "",
      project_id: projectId,
    };
    const listItem = document.createElement("li");
    environmentsList.append(listItem);
    createEnvironmentsEdit(listItem, environment, environments, true);
  });

  environments.forEach((environment) => {
    const listItem = document.createElement("li");

    renderEnvironmentRead(listItem, environment, environments);

    environmentsList.append(listItem);
  });

  section.append(title, environmentsList, addButton);

  return section;
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

  if (environment.type === "") {
    typeSelect.value = optionDev.value;
  } else {
    typeSelect.value = environment.type;
  }

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

    if (isNew) {
      const createdEnvironment = await setEnvironment(updatedEnvironment);
      environments.push(createdEnvironment);
      renderEnvironmentRead(listItem, createdEnvironment, environments);
      return;
    }
    await modifyEnvironment(updatedEnvironment, updatedEnvironment.id);

    environment.type = updatedEnvironment.type;
    environment.url = updatedEnvironment.url;

    renderEnvironmentRead(listItem, environment, environments);
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

function createRepositoriesRead(repositories, projectId) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Repositorios";
  const repositoriesList = document.createElement("ul");
  const addButton = createAddButton("Añadir repositorio", () => {
    const repository = { project_id: projectId, type: "", url: "" };
    const listItem = document.createElement("li");
    repositoriesList.append(listItem);
    createRepositoryEdit(listItem, repository, repositories, true);
  });

  repositories.forEach((repository) => {
    const listItem = document.createElement("li");

    renderRepositoryRead(listItem, repository, repositories);
    repositoriesList.append(listItem);
  });

  section.append(title, repositoriesList, addButton);
  return section;
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

  if (repository.type === "") {
    typeSelect.value = optionBack.value;
  } else {
    typeSelect.value = repository.type;
  }

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

    if (isNew) {
      const createdRepository = await setRepository(updatedRepository);
      repositories.push(createdRepository);
      renderRepositoryRead(listItem, createdRepository, repositories);
      return;
    }

    await modifyRepository(updatedRepository, updatedRepository.id);

    repository.type = updatedRepository.type;
    repository.url = updatedRepository.url;
    renderRepositoryRead(listItem, repository, repositories);
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

function createServicesRead(services, projectId) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Servicios";
  const servicesList = document.createElement("ul");
  const addButton = createAddButton("Añadir servicio", () => {
    const service = { project_id: projectId, name: "" };
    const listItem = document.createElement("li");
    servicesList.append(listItem);
    createServiceEdit(listItem, service, services, true);
  });

  services.forEach((service) => {
    const listItem = document.createElement("li");

    renderServiceRead(listItem, service, services);
    servicesList.append(listItem);
  });

  section.append(title, servicesList, addButton);
  return section;
}

function createServiceEdit(listItem, service, services, isNew = false) {
  listItem.replaceChildren();

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = service.name;

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

    if (isNew) {
      const createdService = await setService(updatedService);
      services.push(createdService);
      renderServiceRead(listItem, createdService, services);
      return;
    }

    await modifyService(updatedService, updatedService.id);

    service.name = updatedService.name;
    renderServiceRead(listItem, service, services);
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

function createDomainsRead(domains, projectId) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Dominios";
  const domainsList = document.createElement("ul");
  const addButton = createAddButton("Añadir dominio", () => {
    const domain = { project_id: projectId, url: "" };
    const listItem = document.createElement("li");
    domainsList.append(listItem);
    createDomainEdit(listItem, domain, domains, true);
  });

  domains.forEach((domain) => {
    const listItem = document.createElement("li");

    renderDomainRead(listItem, domain, domains);
    domainsList.append(listItem);
  });

  section.append(title, domainsList, addButton);
  return section;
}

function createDomainEdit(listItem, domain, domains, isNew = false) {
  listItem.replaceChildren();

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.value = domain.url;

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

    if (isNew) {
      const createdDomain = await setDomain(updatedDomain);
      domains.push(createdDomain);
      renderDomainRead(listItem, createdDomain, domains);
      return;
    }

    await modifyDomain(updatedDomain, updatedDomain.id);

    domain.url = updatedDomain.url;
    renderDomainRead(listItem, domain, domains);
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

function createCommandsRead(commands, projectId) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Comandos";
  const commandsList = document.createElement("ul");
  const addButton = createAddButton("Añadir comando", () => {
    const command = { project_id: projectId, name: "", instruction: "" };
    const listItem = document.createElement("li");
    commandsList.append(listItem);
    createCommandEdit(listItem, command, commands, true);
  });

  commands.forEach((command) => {
    const listItem = document.createElement("li");

    renderCommandRead(listItem, command, commands);
    commandsList.append(listItem);
  });

  section.append(title, commandsList, addButton);
  return section;
}

function createCommandEdit(listItem, command, commands, isNew = false) {
  listItem.replaceChildren();

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = command.name;

  const instructionInput = document.createElement("input");
  instructionInput.type = "text";
  instructionInput.value = command.instruction;

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

    if (isNew) {
      const createdCommand = await setCommand(updatedCommand);
      commands.push(createdCommand);
      renderCommandRead(listItem, createdCommand, commands);
      return;
    }

    await modifyCommand(updatedCommand, updatedCommand.id);

    command.name = updatedCommand.name;
    command.instruction = updatedCommand.instruction;
    renderCommandRead(listItem, command, commands);
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

function createLinksRead(links, projectId) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Documentación";
  const linksList = document.createElement("ul");
  const addButton = createAddButton("Añadir documentación", () => {
    const linkData = { project_id: projectId, title: "", url: "" };
    const listItem = document.createElement("li");
    linksList.append(listItem);
    createLinkEdit(listItem, linkData, links, true);
  });

  links.forEach((link) => {
    const listItem = document.createElement("li");

    renderLinkRead(listItem, link, links);
    linksList.append(listItem);
  });

  section.append(title, linksList, addButton);
  return section;
}

function createLinkEdit(listItem, linkData, links, isNew = false) {
  listItem.replaceChildren();

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = linkData.title;

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.value = linkData.url;

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

    if (isNew) {
      const createdLink = await setLink(updatedLink);
      links.push(createdLink);
      renderLinkRead(listItem, createdLink, links);
      return;
    }

    await modifyLink(updatedLink, updatedLink.id);

    linkData.title = updatedLink.title;
    linkData.url = updatedLink.url;
    renderLinkRead(listItem, linkData, links);
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

function createNotesRead(notes, projectId) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Notas";
  const notesList = document.createElement("ul");
  const addButton = createAddButton("Añadir nota", () => {
    const note = { project_id: projectId, description: "", content: "" };
    const listItem = document.createElement("li");
    notesList.append(listItem);
    createNoteEdit(listItem, note, notes, true);
  });

  notes.forEach((note) => {
    const listItem = document.createElement("li");

    renderNoteRead(listItem, note, notes);
    notesList.append(listItem);
  });

  section.append(title, notesList, addButton);
  return section;
}

function createNoteEdit(listItem, note, notes, isNew = false) {
  listItem.replaceChildren();

  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.value = note.description;

  const contentInput = document.createElement("textarea");
  contentInput.value = note.content;
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

    if (isNew) {
      const createdNote = await setNote(updatedNote);
      notes.push(createdNote);
      renderNoteRead(listItem, createdNote, notes);
      return;
    }

    await modifyNote(updatedNote, updatedNote.id);

    note.description = updatedNote.description;
    note.content = updatedNote.content;
    renderNoteRead(listItem, note, notes);
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

function createAddButton(text, onClick) {
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.classList.add("modal-add-button");
  addButton.textContent = text;
  addButton.addEventListener("click", onClick);
  return addButton;
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
