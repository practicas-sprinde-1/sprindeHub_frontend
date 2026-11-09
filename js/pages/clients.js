import {
  getArchivedClients,
  getClients,
  getFavoriteClients,
} from "../api/client.api.js";
import { getProjectByClientId } from "../api/project.api.js";
import { createHeader } from "../components/header.js";

const storedUser = sessionStorage.getItem("userInfo");
let currentUser;
if (storedUser) {
  currentUser = JSON.parse(storedUser);
}
document
  .querySelector("#header-container")
  .append(createHeader(currentUser.username, "./profile.html"));

const tableBody = document.querySelector("#clients-table-body");
const searchInput = document.querySelector("#input-clients");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");

const archivedClientsButton = document.querySelector("#archived-clients");
const activeClientsButton = document.querySelector("#actived-clients");
const favoriteClientsButton = document.querySelector("#favorite-clients");

const tableState = {
  search: "",
  page: 1,
  limit: Number(recordsPerPageSelect.value),
  view: "active",
};

function createLink({ className, href, text }) {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.textContent = text;
  return link;
}

function createTextCell(text) {
  const cell = document.createElement("td");
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

async function renderClients(clientList) {
  const rows = [];

  for (const client of clientList) {
    rows.push(await createClientRow(client));
  }

  tableBody.replaceChildren(...rows);
}

async function getClientsByTableState() {
  const offset = (tableState.page - 1) * tableState.limit;

  if (tableState.view === "favorites") {
    return getFavoriteClients(tableState.limit, offset, tableState.search);
  }

  if (tableState.view === "archived") {
    return getArchivedClients(tableState.limit, offset, tableState.search);
  }

  return getClients("clients", tableState.limit, offset, tableState.search);
}

function updatePagination(clientCount) {
  pageInformation.textContent = `Página ${tableState.page}`;
  previousPageButton.disabled = tableState.page === 1;
  nextPageButton.disabled = clientCount < tableState.limit;
}

async function loadClients() {
  const response = await getClientsByTableState();
  const loadedClients = response.items;

  await renderClients(loadedClients);
  updatePagination(loadedClients.length);
}
await loadClients();

let searchDebounceTimeout;

searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounceTimeout);

  searchDebounceTimeout = setTimeout(() => {
    tableState.search = searchInput.value.trim().toLowerCase();
    tableState.page = 1;
    loadClients();
  }, 500);
});

recordsPerPageSelect.addEventListener("change", () => {
  tableState.limit = Number(recordsPerPageSelect.value);
  tableState.page = 1;
  loadClients();
});
previousPageButton.addEventListener("click", async () => {
  if (tableState.page === 1) return;

  tableState.page--;
  await loadClients();
  window.scrollTo(0, 0);
});
nextPageButton.addEventListener("click", async () => {
  tableState.page++;
  await loadClients();
  window.scrollTo(0, 0);
});
document.querySelector("#button-new-client").addEventListener("click", () => {
  window.location.href = "./new-client.html";
});

function showClientView(view) {
  tableState.view = view;
  tableState.page = 1;
  loadClients();
}

archivedClientsButton.onclick = () => showClientView("archived");

activeClientsButton.onclick = () => showClientView("active");

favoriteClientsButton.onclick = () => showClientView("favorites");
