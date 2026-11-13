import { createPaginatedTable } from "../components/paginated-table.js";
import { createHeader } from "../components/header.js";
import { createDetailCard } from "../components/detail-card.js";
import { openNewClientModal } from "../features/client-create-modal.js";
import { showNotification } from "../components/notifications.js";
import {
  getArchivedProjects,
  getFavoriteProjects,
  getProjects,
} from "../api/project.api.js";
import { getCommandsByProjectId } from "../api/command.api.js";
import { getLinksByProjectId } from "../api/link.api.js";
import { getNotesByProjectId } from "../api/note.api.js";
import { getProfile } from "../api/profile.api.js";

const headerContainer = document.querySelector("#header-container");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");
const searchInput = document.querySelector("#input-index");
const showArchivedButton = document.querySelector("#archived-projects");
const showActiveButton = document.querySelector("#actived-projects");
const showFavoritesButton = document.querySelector("#favorite-projects");
const tableBody = document.querySelector("#projects-table-body");
const tableStatusMessage = document.querySelector("#projects-status");
const projectsTable = document.querySelector(".projects-table");
const tableTitles = document.querySelector(".table-titles");
const createNewProjectButton = document.querySelector("#button-new-project");
const createNewClientButton = document.querySelector("#button-new-client");

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

let openedDetailCard;
let latestDetailLoadId = 0;

async function renderProfileHeader() {
  const user = await getProfile();

  sessionStorage.setItem("userInfo", JSON.stringify(user));
  headerContainer.append(createHeader(user.username, "./pages/profile.html"));
}

function loadProjectsPage(request) {
  const limit = request.limit;
  const offset = request.offset;
  const search = request.search;
  const view = request.filters.view;

  if (view === "favorites") {
    return getFavoriteProjects(limit, offset, search);
  }

  if (view === "archived") {
    return getArchivedProjects(limit, offset, search);
  }

  return getProjects("projects", limit, offset, search);
}

function createProjectRow(project) {
  const row = document.createElement("tr");

  row.append(
    createClientCell(project.client),
    createProjectCell(project),
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

function createProjectCell(project) {
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

  projectsTable.append(detailCard);
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

const projectTable = createPaginatedTable({
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
    closeProjectDetail();
    showTableStatus("Cargando proyectos...");
  },
  onLoadEnd: () => showTableStatus(""),
});

showArchivedButton.addEventListener("click", () => {
  projectTable.setFilters({ view: "archived" });
});

showActiveButton.addEventListener("click", () => {
  projectTable.setFilters({ view: "active" });
});

showFavoritesButton.addEventListener("click", () => {
  projectTable.setFilters({ view: "favorites" });
});

createNewProjectButton.addEventListener("click", () => {
  window.location.href = "./pages/new-project.html";
});

createNewClientButton.addEventListener("click", () => {
  openNewClientModal();
});

await renderProfileHeader();
await projectTable.load();

function showTableStatus(message) {
  tableStatusMessage.textContent = message;
  tableStatusMessage.hidden = !message;
}
