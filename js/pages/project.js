import { createHeader } from "../components/header.js";
import { createConfirmModal } from "../components/confirm-modal.js";
import { renderCommands } from "../utils/render-commands.js";
import { renderDocumentationLinks } from "../utils/render-documentation-links.js";
import { renderNotes } from "../utils/render-notes.js";
import { createEditModalProject } from "../components/project-edit-modal.js";
import {
  deleteProjectById,
  favoriteProject,
  unfavoriteProject,
  getProjectById,
} from "../api/project.api.js";
import { showNotification } from "../components/notifications.js";

start();

async function start() {
  renderHeader();

  const projectId = getProjectIdFromUrl();
  const project = await getProjectById(projectId);

  if (!isValidProject(projectId, project)) {
    showProjectError();
    return;
  }

  renderProject(project);
  document.querySelector("#project-detail").hidden = false;
}

function renderHeader() {
  const storedUser = sessionStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : undefined;

  document
    .querySelector("#header-container")
    .append(createHeader(user.username, "./profile.html"));
}

function getProjectIdFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  return Number(searchParams.get("id"));
}

function isValidProject(projectId, project) {
  return Number.isInteger(projectId) && projectId >= 1 && Boolean(project);
}

function showProjectError() {
  const errorMessage = document.querySelector("#project-error");
  errorMessage.hidden = false;
  errorMessage.textContent =
    "Ha ocurrido algún error con este proyecto. Inténtelo de nuevo más tarde";
}

function renderProject(project) {
  renderProjectData(project);
  renderProjectData(project);
  configureProjectActions(project);
}

function renderProjectData(project) {
  document.title = `${project.name} - Sprinde`;
  renderClient(project.client);

  document.querySelector("#project-name").textContent = project.name;
  document.querySelector("#project-description").textContent =
    project.description;

  const statusElement = document.querySelector("#project-status");
  statusElement.textContent = project.is_active ? "Activo" : "Inactivo";
  statusElement.classList.toggle("project-status--active", project.is_active);
  statusElement.classList.toggle(
    "project-status--inactive",
    !project.is_active,
  );
}

function renderClient(client) {
  if (client === null) return;

  const clientLink = document.querySelector("#project-client");
  clientLink.textContent = `Cliente: ${client?.name}`;
  clientLink.href = `./client.html?id=${client?.id}`;
}

function renderProjectData(project) {
  renderLinkList(
    "#project-environments",
    project.environments.map((environment) => ({
      label: environment.type,
      url: environment.url,
    })),
  );

  renderLinkList(
    "#project-repositories",
    project.repositories.map((repository) => ({
      label: repository.type,
      url: repository.url,
    })),
  );

  renderList(
    "#project-services",
    project.services.map((service) => service.name),
  );

  renderLinkList(
    "#project-domains",
    project.domains.map((domain) => ({
      label: domain.url,
      url: domain.url,
    })),
  );

  renderCommandsDocsAndNotes(project);
}

function renderCommandsDocsAndNotes(project) {
  const commandsList = document.querySelector("#project-commands");
  const documentationList = document.querySelector("#project-links");
  const notesList = document.querySelector("#project-notes");

  commandsList.replaceChildren();
  documentationList.replaceChildren();
  notesList.replaceChildren();

  renderCommands(
    commandsList,
    project.commands.map((command) => ({
      name: command.name,
      instruction: command.instruction,
    })),
  );

  renderDocumentationLinks(
    documentationList,
    project.links.map((link) => ({
      title: link.title,
      url: link.url,
    })),
  );

  renderNotes(
    notesList,
    project.notes.map((note) => ({
      description: note.description,
      content: note.content,
    })),
  );
}

function configureProjectActions(project) {
  configureEditAction(project);
  configureFavoriteAction(project);
  configureDeleteAction(project);
}

function configureEditAction(project) {
  const editButton = document.querySelector("#button-edit-project");

  editButton.onclick = async () => {
    if (document.querySelector(".modal-overlay")) return;

    const modal = await createEditModalProject(project, renderProject);
    document.body.append(modal);
  };
}

function configureFavoriteAction(project) {
  const favoriteButton = document.querySelector("#button-favorite-project");
  updateFavoriteButton(favoriteButton, project.is_favorite);

  favoriteButton.onclick = async () => {
    favoriteButton.disabled = true;
    const wasFavorite = project.is_favorite;

    try {
      await updateFavoriteStatus(project, wasFavorite);
      showFavoriteSuccessNotification(wasFavorite);
      updateFavoriteButton(favoriteButton, project.is_favorite);
    } catch (error) {
      showFavoriteErrorNotification(wasFavorite, error);
    } finally {
      favoriteButton.disabled = false;
    }
  };
}

async function updateFavoriteStatus(project, wasFavorite) {
  if (wasFavorite) {
    await unfavoriteProject(project.id);
    project.is_favorite = false;
    return;
  }

  await favoriteProject(project.id);
  project.is_favorite = true;
}

function updateFavoriteButton(favoriteButton, isFavorite) {
  favoriteButton.textContent = isFavorite
    ? "Quitar de favoritos"
    : "Añadir a favoritos";
}

function showFavoriteSuccessNotification(wasFavorite) {
  showNotification({
    type: "success",
    title: wasFavorite
      ? "Proyecto eliminado de favoritos"
      : "Proyecto añadido a favoritos",
    message: wasFavorite
      ? "Se ha eliminado de favoritos correctamente"
      : "Se ha añadido a favoritos correctamente",
  });
}

function showFavoriteErrorNotification(wasFavorite, error) {
  showNotification({
    type: "error",
    title: wasFavorite
      ? "Error al eliminar de favoritos"
      : "Error al añadirlo a favoritos",
    message: error.message,
  });
}

function configureDeleteAction(project) {
  const deleteButton = document.querySelector(".button-delete-project");

  deleteButton.onclick = () => {
    if (document.querySelector(".confirm-overlay")) return;

    const confirmModal = createConfirmModal(
      "Borrar proyecto",
      `¿Estás seguro de que deseas borrar el proyecto "${project.name}"?`,
      async () => {
        await deleteProjectById(project.id);
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 2000);
      },
    );

    document.body.append(confirmModal);
  };
}

function renderList(selector, items) {
  const list = document.querySelector(selector);
  list.replaceChildren();

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
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
