import { createHeader } from "../components/header.js";
import { renderCommands } from "../utils/render-commands.js";
import { renderDocumentationLinks } from "../utils/render-documentation-links.js";
import { renderNotes } from "../utils/render-notes.js";
import { createEditModalProject } from "../components/project-edit-modal.js";
import { createAlertModal } from "../components/alert-modal.js";
import { deleteProjectById, getProjectById } from "../api/project.api.js";

start();

async function start() {
  const headerContainer = document.querySelector("#header-container");
  headerContainer.append(createHeader("César", "./profile.html"));

  const projectDetail = document.querySelector("#project-detail");
  const projectError = document.querySelector("#project-error");

  const searchParams = new URLSearchParams(window.location.search);
  const projectId = Number(searchParams.get("id"));

  const project = await getProjectById(projectId);

  if (!Number.isInteger(projectId) || projectId < 1 || !project) {
    projectError.hidden = false;
    projectError.textContent =
      "Ha ocurrido algún error con este proyecto. Inténtelo de nuevo más tarde";
  } else {
    renderProject(project);
    projectDetail.hidden = false;
  }
}

function renderProject(project) {
  document.title = `${project.name} - Sprinde`;
  const clientLink = document.querySelector("#project-client");
  if (project.client !== null) {
    clientLink.textContent = project.client?.name ?? "No asignado";
    clientLink.href = null;
    clientLink.href = `./client.html?id=${project.client?.id}`;
  }

  document.querySelector("#project-name").textContent = project.name;
  document.querySelector("#project-description").textContent =
    project.description;

  const status = document.querySelector("#project-status");
  status.textContent = project.is_active ? "Activo" : "Inactivo";

  // Muestra el estilo correspondiente al estado actual del proyecto.
  status.classList.toggle("project-status--active", project.is_active);
  status.classList.toggle("project-status--inactive", !project.is_active);

  const environmentsInfo = project.environments.map((environment) => ({
    label: environment.type,
    url: environment.url,
  }));

  const repositoriesInfo = project.repositories.map((repository) => ({
    label: repository.type,
    url: repository.url,
  }));

  const servicesInfo = project.services.map((service) => service.name);

  const domainsInfo = project.domains.map((domain) => ({
    label: domain.url,
    url: domain.url,
  }));

  const commandsInfo = project.commands.map((command) => ({
    name: command.name,
    instruction: command.instruction,
  }));

  const linksInfo = project.links.map((link) => ({
    title: link.title,
    url: link.url,
  }));

  const notesInfo = project.notes.map((note) => ({
    description: note.description,
    content: note.content,
  }));

  renderLinkList("#project-environments", environmentsInfo);
  renderLinkList("#project-repositories", repositoriesInfo);
  renderList("#project-services", servicesInfo);
  renderLinkList("#project-domains", domainsInfo);
  const commandsList = document.querySelector("#project-commands");
  const documentationList = document.querySelector("#project-links");
  const notesList = document.querySelector("#project-notes");

  commandsList.replaceChildren();
  documentationList.replaceChildren();
  notesList.replaceChildren();
  renderCommands(commandsList, commandsInfo);
  renderDocumentationLinks(documentationList, linksInfo);
  renderNotes(notesList, notesInfo);

  const modifyProject = document.querySelector("#button-edit-project");
  modifyProject.onclick = async () => {
    if (document.querySelector(".modal-overlay")) return;
    const modal = await createEditModalProject(project, renderProject);
    document.body.append(modal);
  };

  const deleteProject = document.querySelector(".button-delete-project");
  deleteProject.onclick = () => {
    if (document.querySelector(".alert-overlay")) return;

    const alertModal = createAlertModal(
      "Borrar proyecto",
      `¿Estás seguro de que deseas borrar el proyecto "${project.name}"?`,
      async () => {
        await deleteProjectById(project.id);
        window.location.href = "../index.html";
      },
    );

    document.body.append(alertModal);
  };
}

function renderList(selector, texts) {
  const list = document.querySelector(selector);
  list.replaceChildren();

  texts.forEach((text) => {
    const listItem = document.createElement("li");
    listItem.textContent = text;
    list.append(listItem);
  });
}

function renderLinkList(selector, links) {
  const list = document.querySelector(selector);
  list.replaceChildren();

  links.forEach((item) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");

    link.href = item.url;
    link.textContent = item.label;
    link.target = "_blank";
    link.rel = "noreferrer";

    listItem.append(link);
    list.append(listItem);
  });
}
