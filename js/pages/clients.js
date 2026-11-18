import { createPaginatedTable } from "../components/paginated-table.js";
import {
  getArchivedClients,
  getClients,
  getFavoriteClients,
} from "../api/client.api.js";
import { getProjectByClientId } from "../api/project.api.js";
import { createHeader } from "../components/header.js";
import { openNewClientModal } from "../features/client-create-modal.js";

const storedUser = sessionStorage.getItem("userInfo");
let currentUser;
if (storedUser) {
  currentUser = JSON.parse(storedUser);
}
document
  .querySelector("#header-container")
  .append(createHeader(currentUser.username, "./profile.html"));

const tableBody = document.querySelector("#clients-table-body");
const tableStatusMessage = document.querySelector("#clients-status");
const searchInput = document.querySelector("#input-clients");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");

const archivedClientsButton = document.querySelector("#archived-clients");
const activeClientsButton = document.querySelector("#actived-clients");
const favoriteClientsButton = document.querySelector("#favorite-clients");

function createLink({ className, href, text }) {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.textContent = text;
  return link;
}

function createTextCell(text) {
  const cell = document.createElement("td");
  cell.className = "cell-centered";
  cell.textContent = text;
  return cell;
}

function createClientNameCell(client) {
  const cell = document.createElement("td");
  const clientLink = createLink({
    className: "client-link",
    href: `./client.html?id=${client.id}`,
    text: client.name,
  });
  cell.append(clientLink);
  return cell;
}

async function createProjectsCell(clientId) {
  const cell = document.createElement("td");
  cell.className = "client-projects";

  const projectsResponse = await getProjectByClientId(clientId);
  const projects = projectsResponse.items ?? projectsResponse;

  projects.forEach((project) => {
    const projectLink = createLink({
      className: "project-link",
      href: `./project.html?id=${project.id}`,
      text: project.name,
    });
    cell.append(projectLink);
  });

  return cell;
}

function createStatusCell(isActive) {
  const cell = document.createElement("td");
  cell.className = "cell-centered";

  const status = document.createElement("span");
  status.className = `status status--${isActive ? "active" : "inactive"}`;
  status.textContent = isActive ? "Activo" : "Inactivo";
  cell.append(status);

  return cell;
}

async function createClientRow(client) {
  const row = document.createElement("tr");
  const projectsCell = await createProjectsCell(client.id);

  row.append(
    createClientNameCell(client),
    createTextCell(client.cif),
    createTextCell(client.phone),
    projectsCell,
    createStatusCell(client.is_active),
  );

  return row;
}

function loadClientsPage(request) {
  const limit = request.limit;
  const offset = request.offset;
  const search = request.search;
  const view = request.filters.view;

  if (view === "favorites") {
    return getFavoriteClients(limit, offset, search);
  }

  if (view === "archived") {
    return getArchivedClients(limit, offset, search);
  }

  return getClients("clients", limit, offset, search);
}

const clientsTable = createPaginatedTable({
  tableBody,
  searchInput,
  recordsPerPageSelect,
  previousPageButton,
  nextPageButton,
  pageInformation,
  loadPage: loadClientsPage,
  createRow: createClientRow,
  errorTitle: "Error al cargar los clientes",
  initialFilters: { view: "active" },
  onLoad: () => showTableStatus("Cargando clientes..."),
  onLoadEnd: () => showTableStatus(""),
});

archivedClientsButton.addEventListener("click", () => {
  clientsTable.setFilters({ view: "archived" });
});

activeClientsButton.addEventListener("click", () => {
  clientsTable.setFilters({ view: "active" });
});

favoriteClientsButton.addEventListener("click", () => {
  clientsTable.setFilters({ view: "favorites" });
});

document.querySelector("#button-new-client").addEventListener("click", () => {
  openNewClientModal(() => clientsTable.load());
});

await clientsTable.load();

function showTableStatus(message) {
  tableStatusMessage.textContent = message;
  tableStatusMessage.hidden = !message;
}
