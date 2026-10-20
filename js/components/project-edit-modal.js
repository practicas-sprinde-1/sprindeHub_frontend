export function createEditModalProject(project, onSave = () => {}) {
  // Reúne en un solo modal las colecciones editables de un proyecto.
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("project-edit-modal");

  const title = document.createElement("h1");
  title.textContent = `Editando proyecto :${project.name}`;
  title.classList.add("modal-title");

  const closeButton = document.createElement("button");
  closeButton.classList.add("modal-close-button");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Cerrar");

  closeButton.addEventListener("click", () => {
    overlay.remove();
  });

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  saveButton.addEventListener("click", () => {
    project.name = projectName.value.trim();
    project.description = projectDescription.value.trim();
    //llamada a la API
    onSave(project);
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

  const environmentsSection = createEnvironmentsRead(project.environments);
  const repositoriesSection = createRepositoriesRead(project.repositories);
  const servicesSection = createServicesRead(project.services);
  const domainsSection = createDomainsRead(project.domains);
  const commandsSection = createCommandsRead(project.commands);
  const linksSection = createLinksRead(project.links);
  const notesSection = createNotesRead(project.notes);

  // Agrupa las acciones para colocarlas juntas en la primera columna del grid del modal.
  const modalActions = document.createElement("div");
  modalActions.classList.add("modal-actions");
  modalActions.append(saveButton, cancelButton);

  modal.append(
    closeButton,
    title,
    projectName,
    projectDescription,
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
function createEnvironmentsRead(environments) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Entornos";

  const environmentsList = document.createElement("ul");
  const addButton = createAddButton("Añadir entorno", () => {
    const environment = { type: "", url: "" };
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

  const typeInput = document.createElement("input");
  typeInput.type = "text";
  typeInput.value = environment.type;

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.value = environment.url;

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

  saveButton.addEventListener("click", () => {
    const updatedEnvironment = {
      ...environment,
      type: typeInput.value.trim(),
      url: urlInput.value.trim(),
    };

    environment.type = updatedEnvironment.type;
    environment.url = updatedEnvironment.url;

    if (isNew) environments.push(environment);
    renderEnvironmentRead(listItem, environment, environments);
  });

  listItem.append(typeInput, urlInput, saveButton, cancelButton);
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
    createDeleteButton(environments, environment, listItem),
  );
}

function createRepositoriesRead(repositories) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Repositorios";
  const repositoriesList = document.createElement("ul");
  const addButton = createAddButton("Añadir repositorio", () => {
    const repository = { type: "", url: "" };
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

  const typeInput = document.createElement("input");
  typeInput.type = "text";
  typeInput.value = repository.type;

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.value = repository.url;

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

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /repositories/{repository.id}.
    repository.type = typeInput.value.trim();
    repository.url = urlInput.value.trim();

    if (isNew) repositories.push(repository);
    renderRepositoryRead(listItem, repository, repositories);
  });

  listItem.append(typeInput, urlInput, saveButton, cancelButton);
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
    createDeleteButton(repositories, repository, listItem),
  );
}

function createServicesRead(services) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Servicios";
  const servicesList = document.createElement("ul");
  const addButton = createAddButton("Añadir servicio", () => {
    const service = { name: "" };
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

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /services/{service.id}.
    service.name = nameInput.value.trim();

    if (isNew) services.push(service);
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
    createDeleteButton(services, service, listItem),
  );
}

function createDomainsRead(domains) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Dominios";
  const domainsList = document.createElement("ul");
  const addButton = createAddButton("Añadir dominio", () => {
    const domain = { url: "" };
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

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /domains/{domain.id}.
    domain.url = urlInput.value.trim();

    if (isNew) domains.push(domain);
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
    createDeleteButton(domains, domain, listItem),
  );
}

function createCommandsRead(commands) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Comandos";
  const commandsList = document.createElement("ul");
  const addButton = createAddButton("Añadir comando", () => {
    const command = { name: "", instruction: "" };
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

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /commands/{command.id}.
    command.name = nameInput.value.trim();
    command.instruction = instructionInput.value.trim();

    if (isNew) commands.push(command);
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
    createDeleteButton(commands, command, listItem),
  );
}

function createLinksRead(links) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Documentación";
  const linksList = document.createElement("ul");
  const addButton = createAddButton("Añadir documentación", () => {
    const linkData = { title: "", url: "" };
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

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /links/{linkData.id}.
    linkData.title = titleInput.value.trim();
    linkData.url = urlInput.value.trim();

    if (isNew) links.push(linkData);
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
    createDeleteButton(links, linkData, listItem),
  );
}

function createNotesRead(notes) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Notas";
  const notesList = document.createElement("ul");
  const addButton = createAddButton("Añadir nota", () => {
    const note = { description: "", content: "" };
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

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /notes/{note.id}.
    note.description = descriptionInput.value.trim();
    note.content = contentInput.value.trim();

    if (isNew) notes.push(note);
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
    createDeleteButton(notes, note, listItem),
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

function createDeleteButton(collection, item, listItem) {
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Eliminar";

  deleteButton.addEventListener("click", () => {
    collection.splice(collection.indexOf(item), 1);
    listItem.remove();
  });

  return deleteButton;
}
