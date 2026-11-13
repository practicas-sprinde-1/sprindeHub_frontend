import { createHeader } from "../components/header.js";
import { createConfirmModal } from "../features/confirm-modal.js";
import { createEditModalClient } from "../features/client-edit-modal.js";
import {
  getClientById,
  deleteClientById,
  favoriteClient,
  unfavoriteClient,
} from "../api/client.api.js";
import { getProjectByClientId } from "../api/project.api.js";
import { getTagsByClientId } from "../api/tag.api.js";
import { showNotification } from "../components/notifications.js";

const CLIENT_ERROR_MESSAGE =
  "Ha ocurrido algún error con este cliente. Inténtelo de nuevo más tarde";

const storedUser = sessionStorage.getItem("userInfo");
const currentUser = storedUser ? JSON.parse(storedUser) : undefined;

document
  .querySelector("#header-container")
  .append(createHeader(currentUser.username, "./profile.html"));

const clientDetail = document.querySelector("#client-detail");
const clientError = document.querySelector("#client-error");
const clientId = Number(new URLSearchParams(window.location.search).get("id"));
const client = await getClientById(clientId);

if (isValidClient(clientId, client)) {
  renderClient(client);
  clientDetail.hidden = false;
} else {
  showClientError();
}

function isValidClient(id, clientData) {
  const isIdAnInteger = Number.isInteger(id);
  const isIdPositive = id >= 1;
  const hasClientData = clientData !== null && clientData !== undefined; // Más claro en JS que usar Boolean()

  return isIdAnInteger && isIdPositive && hasClientData;
}

function showClientError() {
  clientError.hidden = false;
  clientError.textContent = CLIENT_ERROR_MESSAGE;
}

async function renderClient(clientData) {
  renderClientInformation(clientData);
  const assignedProjects = await loadAndRenderProjects(clientData.id);
  await loadAndRenderTags(clientData.id);
  configureEditAction(clientData, assignedProjects);
  configureFavoriteAction(clientData);
  configureDeleteAction(clientData);
}

function renderClientInformation(clientData) {
  document.title = `${clientData.name} - Sprinde`;
  document.querySelector("#client-title").textContent = clientData.name;
  document.querySelector("#client-cif").textContent = clientData.cif;
  document.querySelector("#client-phone").textContent = clientData.phone;

  const status = document.querySelector("#client-status");
  status.textContent = clientData.is_active ? "Activo" : "Inactivo";
  status.classList.toggle("client-status--active", clientData.is_active);
  status.classList.toggle("client-status--inactive", !clientData.is_active);
}

async function loadAndRenderProjects(clientId) {
  const projectsList = document.querySelector("#client-list-projects");
  const projectStatus = document.querySelector("#client-projects-status");

  projectsList?.replaceChildren();

  const projectsResponse = await getProjectByClientId(clientId);
  const projects = projectsResponse.items;

  projectStatus.textContent = projects.length
    ? ""
    : "No se han encontrado proyectos asociados";

  projects.forEach((project) => {
    projectsList.append(createProjectListItem(project));
  });

  return projects;
}

function createProjectListItem(project) {
  const listItem = document.createElement("li");
  const link = document.createElement("a");

  link.href = `./project.html?id=${project.id}`;
  link.textContent = project.name;
  listItem.append(link);

  return listItem;
}

async function loadAndRenderTags(clientId) {
  const tagsList = document.querySelector("#client-list-tags");
  const tagsStatus = document.querySelector("#client-tags-status");
  tagsList.replaceChildren();
  tagsStatus.textContent = "Cargando dispositivos...";

  try {
    const tags = await getTagsByClientId(clientId, 100);

    tagsList.replaceChildren(...tags.map(createTagListItem));
    tagsStatus.textContent = tags.length
      ? ""
      : "Este cliente no tiene dispositivos asociados.";
  } catch {
    tagsStatus.textContent =
      "No se han podido cargar los dispositivos del cliente.";
  }
}

function createTagListItem(tag) {
  const listItem = document.createElement("li");
  const name = document.createElement("strong");
  const details = document.createElement("span");

  name.textContent = `${tag.device_type} · ${tag.brand} ${tag.model}`;
  details.className = "client-tag-details";
  details.textContent = `MAC: ${tag.mac || "—"} · IP: ${tag.ip || "—"}`;
  listItem.append(name, details);

  return listItem;
}

function configureEditAction(clientData, assignedProjects) {
  const editButton = document.querySelector(".button-edit-client");

  editButton.onclick = async () => {
    if (document.querySelector(".modal-overlay")) return;

    editButton.disabled = true;
    try {
      const modal = await createEditModalClient(
        clientData,
        renderClient,
        assignedProjects,
      );
      document.body.append(modal);
    } catch (error) {
      showNotification({
        type: "error",
        title: "No se ha podido abrir la edición del cliente",
        message: error.message,
        duration: 7000,
      });
    } finally {
      editButton.disabled = false;
    }
  };
}

function configureFavoriteAction(clientData) {
  const favoriteButton = document.querySelector("#button-favorite-client");
  updateFavoriteButton(favoriteButton, clientData.is_favorite);

  favoriteButton.onclick = () =>
    toggleFavoriteClient(clientData, favoriteButton);
}

async function toggleFavoriteClient(clientData, favoriteButton) {
  favoriteButton.disabled = true;
  const wasFavorite = clientData.is_favorite;

  try {
    await updateClientFavoriteStatus(clientData.id, wasFavorite);
    clientData.is_favorite = !wasFavorite;
    showFavoriteSuccess(wasFavorite);
    updateFavoriteButton(favoriteButton, clientData.is_favorite);
  } catch (error) {
    showFavoriteError(wasFavorite, error.message);
  } finally {
    favoriteButton.disabled = false;
  }
}

async function updateClientFavoriteStatus(clientId, wasFavorite) {
  if (wasFavorite) {
    await unfavoriteClient(clientId);
    return;
  }

  await favoriteClient(clientId);
}

function updateFavoriteButton(button, isFavorite) {
  button.textContent = isFavorite
    ? "Quitar de favoritos"
    : "Añadir a favoritos";
}

function showFavoriteSuccess(wasFavorite) {
  showNotification({
    type: "success",
    title: wasFavorite
      ? "Cliente eliminado de favoritos"
      : "Cliente añadido a favoritos",
    message: wasFavorite
      ? "Se ha eliminado de favoritos correctamente"
      : "Se ha añadido a favoritos correctamente",
  });
}

function showFavoriteError(wasFavorite, message) {
  showNotification({
    type: "error",
    title: wasFavorite
      ? "Error al eliminar de favoritos"
      : "Error al añadirlo a favoritos",
    message,
  });
}

function configureDeleteAction(clientData) {
  const deleteButton = document.querySelector(".button-delete-client");

  deleteButton.onclick = () => {
    if (document.querySelector(".confirm-overlay")) return;

    const confirmModal = createConfirmModal(
      "Borrar cliente",
      `¿Estás seguro de que deseas borrar el cliente "${clientData.name}"?`,
      () => deleteClientAndRedirect(clientData.id),
    );

    document.body.append(confirmModal);
  };
}

async function deleteClientAndRedirect(clientId) {
  await deleteClientById(clientId);
  setTimeout(() => {
    window.location.href = "./clients.html";
  }, 1000);
}
