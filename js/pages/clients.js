import { createPaginatedTable } from "../components/paginated-table.js";
import {
  deleteClientById,
  getArchivedClients,
  getClients,
  getFavoriteClients,
} from "../api/client.api.js";
import { getProjectByClientId } from "../api/project.api.js";
import { createHeader } from "../components/header.js";
import { showNotification } from "../components/notifications.js";
import { openNewClientModal } from "../features/client-create-modal.js";
import { createEditModalClient } from "../features/client-edit-modal.js";
import { createConfirmModal } from "../features/confirm-modal.js";

const headerContainer = document.querySelector("#header-container");
const tableBody = document.querySelector("#clients-table-body");
const tableStatusMessage = document.querySelector("#clients-status");
const searchInput = document.querySelector("#input-clients");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");
const createClientButton = document.querySelector("#button-new-client");
const editClientButton = document.querySelector("#button-edit-client");
const deleteClientButton = document.querySelector("#button-delete-client");
const archivedClientsButton = document.querySelector("#archived-clients");
const activeClientsButton = document.querySelector("#actived-clients");
const favoriteClientsButton = document.querySelector("#favorite-clients");

let selectedClient = null;
let isLoadingClients = false;
let isClientActionInProgress = false;

configureHeader();

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
  onLoad: () => {
    isLoadingClients = true;
    updateClientActionButtons();
    // Una búsqueda, un filtro o un cambio de página reemplaza las filas visibles.
    clearClientSelection();
    showTableStatus("Cargando clientes...");
  },
  onLoadEnd: () => {
    isLoadingClients = false;
    updateClientActionButtons();
    showTableStatus("");
  },
});

registerEventListeners();
await loadClients();

function configureHeader() {
  const storedUser = sessionStorage.getItem("userInfo");
  const currentUser = storedUser ? JSON.parse(storedUser) : undefined;
  const header = createHeader(currentUser.username, "./profile.html");
  headerContainer.append(header);
}

function registerEventListeners() {
  archivedClientsButton.addEventListener("click", () => {
    clientsTable.setFilters({ view: "archived" });
  });

  activeClientsButton.addEventListener("click", () => {
    clientsTable.setFilters({ view: "active" });
  });

  favoriteClientsButton.addEventListener("click", () => {
    clientsTable.setFilters({ view: "favorites" });
  });

  createClientButton.addEventListener("click", openCreateClientModal);
  editClientButton.addEventListener("click", openEditClientModal);
  deleteClientButton.addEventListener("click", openDeleteClientConfirmation);
}

function loadClients() {
  return clientsTable.load();
}

function loadClientsPage({ limit, offset, search, filters }) {
  const view = filters.view;

  if (view === "favorites") {
    return getFavoriteClients(limit, offset, search);
  }

  if (view === "archived") {
    return getArchivedClients(limit, offset, search);
  }

  return getClients("clients", limit, offset, search);
}

async function loadAssignedClientProjects(clientId) {
  const firstProjectsPage = await getProjectByClientId(clientId, 100);
  if (Array.isArray(firstProjectsPage)) {
    return firstProjectsPage;
  }

  const assignedProjects = [...firstProjectsPage.items];
  const projectsPerPage = firstProjectsPage.limit;
  let nextProjectOffset = projectsPerPage;

  // El editor necesita todas las asignaciones para marcar sus casillas.
  while (nextProjectOffset < firstProjectsPage.total) {
    const nextProjectsPage = await getProjectByClientId(
      clientId,
      projectsPerPage,
      nextProjectOffset,
    );
    assignedProjects.push(...nextProjectsPage.items);
    nextProjectOffset += projectsPerPage;
  }

  return assignedProjects;
}

function showTableStatus(message) {
  tableStatusMessage.textContent = message;
  tableStatusMessage.hidden = !message;
}

async function createClientRow(client) {
  const row = document.createElement("tr");
  const projectsCell = await createProjectsCell(client.id);

  row.addEventListener("click", () => selectClient(client, row));
  row.append(
    createClientNameCell(client),
    createTextCell(client.cif),
    createTextCell(client.phone),
    projectsCell,
    createStatusCell(client.is_active),
  );

  return row;
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

function createTextCell(text) {
  const cell = document.createElement("td");
  cell.className = "cell-centered";
  cell.textContent = text;
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

function createLink({ className, href, text }) {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.textContent = text;
  return link;
}

function selectClient(client, row) {
  if (isLoadingClients) {
    return;
  }

  clearClientSelection();
  selectedClient = client;
  row.classList.add("client-row-selected");
}

function clearClientSelection() {
  selectedClient = null;
  const selectedRow = tableBody.querySelector(".client-row-selected");
  selectedRow?.classList.remove("client-row-selected");
}

function updateClientActionButtons() {
  const shouldDisableClientActions =
    isLoadingClients || isClientActionInProgress;
  editClientButton.disabled = shouldDisableClientActions;
  deleteClientButton.disabled = shouldDisableClientActions;
}

function hasOpenModal() {
  const openModal = document.querySelector(
    ".modal-overlay, .confirm-overlay, dialog[open]",
  );
  return openModal !== null;
}

function notifyMissingSelection(actionDescription) {
  showNotification({
    type: "info",
    title: "Selecciona un cliente",
    message: `Selecciona una fila de la tabla antes de ${actionDescription} el cliente.`,
  });
}

function openCreateClientModal() {
  if (isClientActionInProgress || hasOpenModal()) {
    return;
  }

  openNewClientModal(loadClients);
}

async function openEditClientModal() {
  if (isLoadingClients || isClientActionInProgress || hasOpenModal()) {
    return;
  }

  if (selectedClient === null) {
    notifyMissingSelection("modificar");
    return;
  }

  const clientToEdit = selectedClient;
  // El modal todavía no existe mientras se consultan sus datos.
  isClientActionInProgress = true;
  updateClientActionButtons();

  try {
    const assignedProjects = await loadAssignedClientProjects(clientToEdit.id);
    // La copia conserva los datos de la fila si falla el guardado.
    const editableClient = { ...clientToEdit };
    // La recarga conserva la página aunque el modal devuelva el cliente guardado.
    const editModal = await createEditModalClient(
      editableClient,
      loadClients,
      assignedProjects,
    );

    // Si cambió la selección durante la espera, el formulario ya no corresponde a la fila actual.
    if (selectedClient !== clientToEdit) {
      return;
    }

    document.body.append(editModal);
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se ha podido abrir la edición del cliente",
      message: error.message,
    });
  } finally {
    isClientActionInProgress = false;
    updateClientActionButtons();
  }
}

function openDeleteClientConfirmation() {
  if (isLoadingClients || isClientActionInProgress || hasOpenModal()) {
    return;
  }

  if (selectedClient === null) {
    notifyMissingSelection("eliminar");
    return;
  }

  // El ID queda ligado al cliente que aparece en el mensaje de confirmación.
  const clientIdToDelete = selectedClient.id;
  const confirmModal = createConfirmModal(
    "Eliminar cliente",
    `¿Estás seguro de que deseas eliminar el cliente "${selectedClient.name}"?`,
    async () => {
      isClientActionInProgress = true;
      updateClientActionButtons();

      try {
        await deleteClientById(clientIdToDelete);
        await loadClients();
      } finally {
        isClientActionInProgress = false;
        updateClientActionButtons();
      }
    },
  );

  document.body.append(confirmModal);
}
