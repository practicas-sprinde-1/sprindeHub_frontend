export function createEditModalProject(project) {
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
    //llamada a la API
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

  environments.forEach((environment) => {
    const listItem = document.createElement("li");

    renderEnvironmentRead(listItem, environment);

    environmentsList.append(listItem);
  });

  section.append(title, environmentsList);

  return section;
}

function createEnvironmentsEdit(listItem, environment) {
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
    renderEnvironmentRead(listItem, environment);
  });

  saveButton.addEventListener("click", () => {
    const updatedEnvironment = {
      ...environment,
      type: typeInput.value.trim(),
      url: urlInput.value.trim(),
    };

    environment.type = updatedEnvironment.type;
    environment.url = updatedEnvironment.url;

    renderEnvironmentRead(listItem, environment);
  });

  listItem.append(typeInput, urlInput, saveButton, cancelButton);
}

function renderEnvironmentRead(listItem, environment) {
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
    createEnvironmentsEdit(listItem, environment);
  });

  listItem.append(link, editButton);
}

function createRepositoriesRead(repositories) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Repositorios";
  const repositoriesList = document.createElement("ul");

  repositories.forEach((repository) => {
    const listItem = document.createElement("li");

    renderRepositoryRead(listItem, repository);
    repositoriesList.append(listItem);
  });

  section.append(title, repositoriesList);
  return section;
}

function createRepositoryEdit(listItem, repository) {
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
    renderRepositoryRead(listItem, repository);
  });

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /repositories/{repository.id}.
    repository.type = typeInput.value.trim();
    repository.url = urlInput.value.trim();

    renderRepositoryRead(listItem, repository);
  });

  listItem.append(typeInput, urlInput, saveButton, cancelButton);
}

function renderRepositoryRead(listItem, repository) {
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
    createRepositoryEdit(listItem, repository);
  });

  listItem.append(link, editButton);
}

function createServicesRead(services) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Servicios";
  const servicesList = document.createElement("ul");

  services.forEach((service) => {
    const listItem = document.createElement("li");

    renderServiceRead(listItem, service);
    servicesList.append(listItem);
  });

  section.append(title, servicesList);
  return section;
}

function createServiceEdit(listItem, service) {
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
    renderServiceRead(listItem, service);
  });

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /services/{service.id}.
    service.name = nameInput.value.trim();

    renderServiceRead(listItem, service);
  });

  listItem.append(nameInput, saveButton, cancelButton);
}

function renderServiceRead(listItem, service) {
  listItem.replaceChildren();

  const name = document.createElement("span");
  name.textContent = service.name;

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";

  editButton.addEventListener("click", () => {
    createServiceEdit(listItem, service);
  });

  listItem.append(name, editButton);
}

function createDomainsRead(domains) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Dominios";
  const domainsList = document.createElement("ul");

  domains.forEach((domain) => {
    const listItem = document.createElement("li");

    renderDomainRead(listItem, domain);
    domainsList.append(listItem);
  });

  section.append(title, domainsList);
  return section;
}

function createDomainEdit(listItem, domain) {
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
    renderDomainRead(listItem, domain);
  });

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /domains/{domain.id}.
    domain.url = urlInput.value.trim();

    renderDomainRead(listItem, domain);
  });

  listItem.append(urlInput, saveButton, cancelButton);
}

function renderDomainRead(listItem, domain) {
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
    createDomainEdit(listItem, domain);
  });

  listItem.append(link, editButton);
}

function createCommandsRead(commands) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Comandos";
  const commandsList = document.createElement("ul");

  commands.forEach((command) => {
    const listItem = document.createElement("li");

    renderCommandRead(listItem, command);
    commandsList.append(listItem);
  });

  section.append(title, commandsList);
  return section;
}

function createCommandEdit(listItem, command) {
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
    renderCommandRead(listItem, command);
  });

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /commands/{command.id}.
    command.name = nameInput.value.trim();
    command.instruction = instructionInput.value.trim();

    renderCommandRead(listItem, command);
  });

  listItem.append(nameInput, instructionInput, saveButton, cancelButton);
}

function renderCommandRead(listItem, command) {
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
    createCommandEdit(listItem, command);
  });

  listItem.append(content, editButton);
}

function createLinksRead(links) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Documentación";
  const linksList = document.createElement("ul");

  links.forEach((link) => {
    const listItem = document.createElement("li");

    renderLinkRead(listItem, link);
    linksList.append(listItem);
  });

  section.append(title, linksList);
  return section;
}

function createLinkEdit(listItem, linkData) {
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
    renderLinkRead(listItem, linkData);
  });

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /links/{linkData.id}.
    linkData.title = titleInput.value.trim();
    linkData.url = urlInput.value.trim();

    renderLinkRead(listItem, linkData);
  });

  listItem.append(titleInput, urlInput, saveButton, cancelButton);
}

function renderLinkRead(listItem, linkData) {
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
    createLinkEdit(listItem, linkData);
  });

  listItem.append(content, editButton);
}

function createNotesRead(notes) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  title.textContent = "Notas";
  const notesList = document.createElement("ul");

  notes.forEach((note) => {
    const listItem = document.createElement("li");

    renderNoteRead(listItem, note);
    notesList.append(listItem);
  });

  section.append(title, notesList);
  return section;
}

function createNoteEdit(listItem, note) {
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
    renderNoteRead(listItem, note);
  });

  saveButton.addEventListener("click", () => {
    // Aquí irá PATCH /notes/{note.id}.
    note.description = descriptionInput.value.trim();
    note.content = contentInput.value.trim();

    renderNoteRead(listItem, note);
  });

  listItem.append(descriptionInput, contentInput, saveButton, cancelButton);
}

function renderNoteRead(listItem, note) {
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
    createNoteEdit(listItem, note);
  });

  listItem.append(content, editButton);
}
