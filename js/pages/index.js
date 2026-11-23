import { createPaginatedTable } from "../components/paginated-table.js";
import { createHeader } from "../components/header.js";
import { createDetailCard } from "../components/detail-card.js";
import { openNewClientModal } from "../features/client-create-modal.js";
import { createEditModalProject } from "../features/project-edit-modal.js";
import { createConfirmModal } from "../features/confirm-modal.js";
import { showNotification } from "../components/notifications.js";
import {
  deleteProjectById,
  getArchivedProjects,
  getFavoriteProjects,
  getProjectById,
  getProjects,
} from "../api/project.api.js";
import { getCommandsByProjectId } from "../api/command.api.js";
import { getLinksByProjectId } from "../api/link.api.js";
import { getNotesByProjectId } from "../api/note.api.js";
import { getProfile } from "../api/profile.api.js";

const DETAIL_CARD_SETTINGS = {
  commands: {
    title: "Comandos",
    countKey: "commands_count",
    countLabel: "comandos",
    loadItems: getCommandsByProjectId,
    formatItem: ({ name, instruction }) => ({ name, instruction }),
  },
  links: {
    title: "Documentación",
    countKey: "links_count",
    countLabel: "enlaces",
    loadItems: getLinksByProjectId,
    // Extrae usando desestructuración solo los datos necesarios del objeto de la API
    // y devuelve un nuevo objeto con esos datos para el componente visual.
    formatItem: ({ title, url }) => ({ title, url }),
  },
  notes: {
    title: "Notas",
    countKey: "notes_count",
    countLabel: "notas",
    loadItems: getNotesByProjectId,
    formatItem: ({ description, content }) => ({ description, content }),
  },
};

const headerContainer = document.querySelector("#header-container");
const tableBody = document.querySelector("#projects-table-body");
const tableStatusMessage = document.querySelector("#projects-status");
const searchInput = document.querySelector("#input-index");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");
const createProjectButton = document.querySelector("#button-new-project");
const editProjectButton = document.querySelector("#button-edit-project");
const deleteProjectButton = document.querySelector("#button-delete-project");
const createClientButton = document.querySelector("#button-new-client");
const archivedProjectsButton = document.querySelector("#archived-projects");
const activeProjectsButton = document.querySelector("#actived-projects");
const favoriteProjectsButton = document.querySelector("#favorite-projects");
const projectsTableContainer = document.querySelector(".projects-table");
const tableTitles = document.querySelector(".table-titles");

let selectedProject = null;
let isLoadingProjects = false;
let isProjectActionInProgress = false;
let openedDetailCard;
let latestDetailLoadId = 0;

const projectsTable = createPaginatedTable({
  tableBody,
  searchInput,
  recordsPerPageSelect,
  previousPageButton,
  nextPageButton,
  pageInformation,
  loadPage: loadProjectsPage,
  createRow: createProjectRow,
  errorTitle: "Error al cargar los proyectos",
  initialFilters: { view: "active" },
  onLoad: () => {
    isLoadingProjects = true;
    updateProjectActionButtons();
    clearProjectSelection();
    closeProjectDetail();
    showTableStatus("Cargando proyectos...");
  },
  onLoadEnd: () => {
    isLoadingProjects = false;
    updateProjectActionButtons();
    showTableStatus("");
  },
});

registerEventListeners();
await configureHeader();
await loadProjects();

async function configureHeader() {
  const currentUser = await getProfile();

  sessionStorage.setItem("userInfo", JSON.stringify(currentUser));
  const header = createHeader(currentUser.username, "./pages/profile.html");
  headerContainer.append(header);
}

function registerEventListeners() {
  archivedProjectsButton.addEventListener("click", () => {
    projectsTable.setFilters({ view: "archived" });
  });

  activeProjectsButton.addEventListener("click", () => {
    projectsTable.setFilters({ view: "active" });
  });

  favoriteProjectsButton.addEventListener("click", () => {
    projectsTable.setFilters({ view: "favorites" });
  });

  createProjectButton.addEventListener("click", openCreateProjectPage);
  createClientButton.addEventListener("click", openCreateClientModal);
  editProjectButton.addEventListener("click", openEditProjectModal);
  deleteProjectButton.addEventListener("click", openDeleteProjectConfirmation);
}

function loadProjects() {
  return projectsTable.load();
}

function loadProjectsPage({ limit, offset, search, filters }) {
  const view = filters.view;

  if (view === "favorites") {
    return getFavoriteProjects(limit, offset, search);
  }

  if (view === "archived") {
    return getArchivedProjects(limit, offset, search);
  }

  return getProjects("projects", limit, offset, search);
}

function showTableStatus(message) {
  tableStatusMessage.textContent = message;
  tableStatusMessage.hidden = !message;
}

function createProjectRow(project) {
  const row = document.createElement("tr");

  row.addEventListener("click", () => selectProject(project, row));
  row.append(
    createClientCell(project.client),
    createProjectLinkCell(project),
    createEnvironmentsCell(project.environments),
    createRepositoriesCell(project.repositories),
    createServicesCell(project.services),
    createDomainsCell(project.domains),
    createDetailButtonCell(project, row, "commands"),
    createDetailButtonCell(project, row, "links"),
    createDetailButtonCell(project, row, "notes"),
  );

  return row;
}

function createClientCell(client) {
  const cell = document.createElement("td");
  const clientName = document.createElement("strong");

  clientName.textContent = client?.name ?? "No asignado";
  cell.append(clientName);

  return cell;
}

function createProjectLinkCell(project) {
  const cell = createCenteredCell();
  const link = document.createElement("a");

  link.classList.add("project-link");
  link.href = `./pages/project.html?id=${project.id}`;
  link.textContent = project.name;
  cell.append(link);

  return cell;
}

function createEnvironmentsCell(environments) {
  const cell = createCenteredCell();

  environments.forEach((environment) => {
    const label = document.createElement("span");
    const link = document.createElement("a");

    label.classList.add("environment", `environment--${environment.type}`);
    link.textContent = environment.type;
    link.href = environment.url;
    label.append(link);
    cell.append(label);
  });

  return cell;
}

function createRepositoriesCell(repositories) {
  const cell = createCenteredCell("repositories-cell");

  repositories.forEach((repository) => {
    const link = document.createElement("a");

    link.classList.add("repository-link");
    link.href = repository.url;
    link.textContent = repository.type;
    cell.append(link);
  });

  return cell;
}

function createServicesCell(services) {
  const cell = createCenteredCell();

  services.forEach((service) => {
    const tag = document.createElement("span");

    tag.classList.add("tag");
    tag.textContent = service.name;
    cell.append(tag);
  });

  return cell;
}

function createDomainsCell(domains) {
  const cell = createCenteredCell();

  domains.forEach((domain) => {
    const link = document.createElement("a");

    link.classList.add("domain-link");
    link.href = `https://${domain.url}`;
    link.target = "_blank";
    link.textContent = domain.url;
    cell.append(link);
  });

  return cell;
}

function createDetailButtonCell(project, row, contentType) {
  const cell = createCenteredCell();
  const button = document.createElement("button");
  const configuration = DETAIL_CARD_SETTINGS[contentType];

  button.classList.add("table-count-button");
  button.type = "button";
  button.textContent = `${project[configuration.countKey]} ${configuration.countLabel}`;
  button.addEventListener("click", async () => {
    latestDetailLoadId += 1;
    const loadId = latestDetailLoadId;
    button.disabled = true;

    try {
      const items = await configuration.loadItems(project.id);
      // El detalle solo se abre si sigue siendo la última petición y la fila sigue visible.
      if (loadId !== latestDetailLoadId || !row.isConnected) {
        return;
      }

      const formattedItems = [];
      for (const item of items) {
        const formattedItem = configuration.formatItem(item);
        formattedItems.push(formattedItem);
      }

      showDetailCard(
        row,
        configuration.title,
        formattedItems,
        project.id,
        contentType,
      );
    } catch (error) {
      if (loadId !== latestDetailLoadId || !row.isConnected) {
        return;
      }

      showNotification({
        type: "error",
        title: "Error al cargar el detalle del proyecto",
        message: error.message,
      });
    } finally {
      button.disabled = false;
    }
  });

  cell.append(button);

  return cell;
}

function createCenteredCell(additionalClass) {
  const cell = document.createElement("td");

  cell.classList.add("cell-centered");
  if (additionalClass) {
    cell.classList.add(additionalClass);
  }

  return cell;
}

function showDetailCard(row, title, items, projectId, contentType) {
  if (openedDetailCard) {
    openedDetailCard.remove();
  }

  const projectUrl = `./pages/project.html?id=${projectId}`;
  const detailCard = createDetailCard(title, items, projectUrl, contentType);
  const cardTop = tableTitles.offsetTop + row.offsetTop;

  projectsTableContainer.append(detailCard);
  detailCard.style.top = `${cardTop}px`;
  openedDetailCard = detailCard;
}

function closeProjectDetail() {
  // Descarta también los detalles que todavía se están cargando.
  latestDetailLoadId += 1;
  if (openedDetailCard) {
    openedDetailCard.remove();
  }
}

function selectProject(project, row) {
  if (isLoadingProjects) {
    return;
  }

  clearProjectSelection();
  selectedProject = project;
  row.classList.add("project-row-selected");
}

function clearProjectSelection() {
  selectedProject = null;
  const selectedRow = tableBody.querySelector(".project-row-selected");
  selectedRow?.classList.remove("project-row-selected");
}

function updateProjectActionButtons() {
  const shouldDisableProjectActions =
    isLoadingProjects || isProjectActionInProgress;
  editProjectButton.disabled = shouldDisableProjectActions;
  deleteProjectButton.disabled = shouldDisableProjectActions;
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
    title: "Selecciona un proyecto",
    message: `Selecciona una fila de la tabla antes de ${actionDescription} el proyecto.`,
  });
}

function openCreateProjectPage() {
  window.location.href = "./pages/new-project.html";
}

function openCreateClientModal() {
  if (isProjectActionInProgress || hasOpenModal()) {
    return;
  }

  openNewClientModal();
}

async function openEditProjectModal() {
  if (isLoadingProjects || isProjectActionInProgress || hasOpenModal()) {
    return;
  }

  if (selectedProject === null) {
    notifyMissingSelection("modificar");
    return;
  }

  const projectToEdit = selectedProject;
  // El modal todavía no existe mientras se consultan sus datos.
  isProjectActionInProgress = true;
  updateProjectActionButtons();

  try {
    // La tabla muestra recuentos. El formulario necesita las listas completas.
    const editableProject = await getProjectById(projectToEdit.id);
    const editModal = await createEditModalProject(editableProject, loadProjects);

    // Si cambió la selección durante la espera, el formulario ya no corresponde a la fila actual.
    if (selectedProject !== projectToEdit) {
      return;
    }

    document.body.append(editModal);
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se ha podido abrir la edición del proyecto",
      message: error.message,
    });
  } finally {
    isProjectActionInProgress = false;
    updateProjectActionButtons();
  }
}

function openDeleteProjectConfirmation() {
  if (isLoadingProjects || isProjectActionInProgress || hasOpenModal()) {
    return;
  }

  if (selectedProject === null) {
    notifyMissingSelection("eliminar");
    return;
  }

  // El ID queda ligado al proyecto que aparece en el mensaje de confirmación.
  const projectIdToDelete = selectedProject.id;
  const confirmModal = createConfirmModal(
    "Eliminar proyecto",
    `¿Estás seguro de que deseas eliminar el proyecto "${selectedProject.name}"? Se borrarán también sus registros relacionados.`,
    async () => {
      isProjectActionInProgress = true;
      updateProjectActionButtons();

      try {
        await deleteProjectById(projectIdToDelete);
        await loadProjects();
      } finally {
        isProjectActionInProgress = false;
        updateProjectActionButtons();
      }
    },
  );

  document.body.append(confirmModal);
}
