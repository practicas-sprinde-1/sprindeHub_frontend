import { createPaginatedTable } from "../components/paginated-table.js";
import { getClientById } from "../api/client.api.js";
import { getCommandById } from "../api/command.api.js";
import { getDomainById } from "../api/domain.api.js";
import { getEnvironmentById } from "../api/environment.api.js";
import { getLinkById } from "../api/link.api.js";
import { getLogsPage } from "../api/log.api.js";
import { getNoteById } from "../api/note.api.js";
import { getProjectById } from "../api/project.api.js";
import { getRepositoryById } from "../api/repository.api.js";
import { getServiceById } from "../api/service.api.js";
import { getUsers } from "../api/user.api.js";
import { createHeader } from "../components/header.js";
import { createLogsFilterBar } from "../components/logs-filter-bar.js";
import { showNotification } from "../components/notifications.js";

const USERS_PAGE_SIZE = 100;
const ENTITY_LOADERS = {
  CLIENT: getClientById,
  PROJECT: getProjectById,
  COMMAND: getCommandById,
  DOMAIN: getDomainById,
  ENVIRONMENT: getEnvironmentById,
  LINK: getLinkById,
  NOTE: getNoteById,
  REPOSITORY: getRepositoryById,
  SERVICE: getServiceById,
};

checkUserAccess();

const tableBody = document.querySelector("#logs-table-body");
const tableStatusMessage = document.querySelector("#logs-status");
const searchInput = document.querySelector("#input-logs");
const filtersContainer = document.querySelector("#filters-container");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");

const users = await loadUsers();

async function loadUsers() {
  const allUsers = [];
  let hasMoreUsers = true;

  while (hasMoreUsers) {
    const currentOffset = allUsers.length;
    const usersPage = await getUsers("users", USERS_PAGE_SIZE, currentOffset);

    allUsers.push(...usersPage);

    if (usersPage.length < USERS_PAGE_SIZE) {
      hasMoreUsers = false;
    }
  }

  return allUsers;
}

function checkUserAccess() {
  const storedUser = sessionStorage.getItem("userInfo");
  const currentUser = storedUser ? JSON.parse(storedUser) : undefined;
  const headerContainer = document.querySelector("#header-container");
  headerContainer.append(createHeader(currentUser.username, "./profile.html"));

  if (currentUser.role === "ADMIN") return;

  showNotification({
    type: "error",
    title: "Acceso no autorizado",
    message: "No tienes acceso a esta página. Contacta con un administrador.",
    duration: 5000,
  });

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1500);
}

function createCell(text = "") {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createEntityLink({ href, text }) {
  const link = document.createElement("a");
  link.href = href;
  link.className = "project-link";
  link.textContent = text;
  return link;
}

function getEntityLabel(entity) {
  if (entity.description) return entity.description;
  if (entity.url) return entity.url;
  return entity.name || "";
}

async function getLinksCell(log, entity) {
  const linksCell = createCell();

  if (entity?.project_id) {
    const project = await findEntity("PROJECT", entity.project_id);

    if (project) {
      linksCell.append(
        createEntityLink({
          href: `./project.html?id=${entity.project_id}`,
          text: project.name,
        }),
      );
    } else {
      linksCell.textContent = "Proyecto eliminado";
    }
  }

  if (log.affected_entity === "CLIENT" && entity != null) {
    linksCell.append(
      createEntityLink({
        href: `./client.html?id=${entity.id}`,
        text: entity.name,
      }),
    );
  }

  if (log.affected_entity === "PROJECT" && entity != null) {
    linksCell.append(
      createEntityLink({
        href: `./project.html?id=${entity.id}`,
        text: entity.name,
      }),
    );
  }

  return linksCell;
}

async function createLogRow(log) {
  const logUser = users.find((user) => user.id === log.user_id);
  const entity = await findEntity(log.affected_entity, log.affected_entity_id);

  const userCell = createCell(logUser?.username ?? "Usuario no disponible");
  const actionCell = createCell(log.action);
  const entityTypeCell = createCell(log.affected_entity);
  const entityCell = createCell(
    entity ? getEntityLabel(entity) : "Entidad eliminada",
  );
  const dateCell = createCell(
    new Date(log.created_at).toLocaleString("es-ES").replaceAll("/", "-"),
  );
  const relatedLinksCell = await getLinksCell(log, entity);

  const row = document.createElement("tr");
  row.append(
    userCell,
    actionCell,
    entityTypeCell,
    entityCell,
    dateCell,
    relatedLinksCell,
  );
  return row;
}

function loadLogsPage(request) {
  return getLogsPage(
    request.limit,
    request.offset,
    request.search,
    request.filters,
  );
}

function handleFiltersChanged(filters) {
  return logsTable.setFilters(filters);
}

const logsTable = createPaginatedTable({
  tableBody,
  searchInput,
  recordsPerPageSelect,
  previousPageButton,
  nextPageButton,
  pageInformation,
  loadPage: loadLogsPage,
  createRow: createLogRow,
  errorTitle: "Error al cargar los registros",
  onLoad: () => showTableStatus("Cargando registros..."),
  onLoadEnd: () => showTableStatus(""),
});

const logsFilterBar = createLogsFilterBar(handleFiltersChanged, users);
filtersContainer.appendChild(logsFilterBar);

await logsTable.load();

export async function findEntity(entityType, entityId) {
  const loadEntity = ENTITY_LOADERS[entityType];
  if (!loadEntity) return undefined;

  try {
    return await loadEntity(entityId);
  } catch {
    return null;
  }
}

function showTableStatus(message) {
  tableStatusMessage.textContent = message;
  tableStatusMessage.hidden = !message;
}
