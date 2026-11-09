import { getClientById } from "../api/client.api.js";
import { getCommandById } from "../api/command.api.js";
import { getDomainById } from "../api/domain.api.js";
import { getEnvironmentById } from "../api/environment.api.js";
import { getLinkById } from "../api/link.api.js";
import { getLogs } from "../api/log.api.js";
import { getNoteById } from "../api/note.api.js";
import { getProjectById } from "../api/project.api.js";
import { getRepositoryById } from "../api/repository.api.js";
import { getServiceById } from "../api/service.api.js";
import { getUsers } from "../api/user.api.js";
import { createHeader } from "../components/header.js";
import { showNotification } from "../components/notifications.js";

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
const searchInput = document.querySelector("#input-logs");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");

const users = await getUsers("users", 100, 0);
let currentLogs = [];
const tableState = {
  search: "",
  page: 1,
  limit: Number(recordsPerPageSelect.value),
};

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

  if (log.affected_entity === "CLIENT" && entity !== null) {
    linksCell.append(
      createEntityLink({
        href: `./client.html?id=${entity.id}`,
        text: entity.name,
      }),
    );
  }

  if (log.affected_entity === "PROJECT" && entity !== null) {
    linksCell.append(
      createEntityLink({
        href: `./project.html?id=${entity.id}`,
        text: entity.name,
      }),
    );
  }

  return linksCell;
}

async function getLogRow(log) {
  const logUser = users.find((user) => user.id === log.user_id);
  const entity = await findEntity(log.affected_entity, log.affected_entity_id);

  const userCell = createCell(logUser.username);
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

async function renderTable(logsToRender) {
  const rows = [];

  for (const log of logsToRender) {
    rows.push(await getLogRow(log));
  }

  tableBody.replaceChildren(...rows);
}

function updatePagination() {
  pageInformation.textContent = `Página ${tableState.page}`;
  previousPageButton.disabled = tableState.page === 1;
  nextPageButton.disabled = currentLogs.length < tableState.limit;
}

async function loadLogs() {
  const offset = (tableState.page - 1) * tableState.limit;
  currentLogs = await getLogs(
    "logs",
    tableState.limit,
    offset,
    tableState.search,
  );

  await renderTable(currentLogs);
  updatePagination();
}

await loadLogs();

let searchTimeout;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    tableState.search = searchInput.value.trim().toLowerCase();
    tableState.page = 1;
    loadLogs();
  }, 500);
});

recordsPerPageSelect.addEventListener("change", () => {
  tableState.limit = Number(recordsPerPageSelect.value);
  tableState.page = 1;
  loadLogs();
});

previousPageButton.addEventListener("click", async () => {
  if (tableState.page === 1) return;

  tableState.page--;
  await loadLogs();
  window.scrollTo(0, 0);
});

nextPageButton.addEventListener("click", async () => {
  tableState.page++;
  await loadLogs();
  window.scrollTo(0, 0);
});

export async function findEntity(entityType, entityId) {
  const loadEntity = ENTITY_LOADERS[entityType];
  if (!loadEntity) return undefined;

  try {
    return await loadEntity(entityId);
  } catch {
    return null;
  }
}
