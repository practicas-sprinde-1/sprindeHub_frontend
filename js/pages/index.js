import { createHeader } from "../components/header.js";
import { createDetailCard } from "../components/detail-card.js";
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
const projectsTable = document.querySelector(".projects-table");
const tableTitles = document.querySelector(".table-titles");
const createNewProjectButton = document.querySelector("#button-new-project");
const createNewClientButton = document.querySelector("#button-new-client");

const tableState = {
  search: "",
  page: 1,
  limit: Number(recordsPerPageSelect.value),
  view: "active",
};

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
let searchTimeout;

async function renderProfileHeader() {
  const user = await getProfile();

  sessionStorage.setItem("userInfo", JSON.stringify(user));
  headerContainer.append(createHeader(user.username, "./pages/profile.html"));
}

async function loadProjects() {
  const response = await getProjectsByTableState();
  const loadedProjects = response.items;

  renderProjects(loadedProjects);
  updatePagination(loadedProjects.length);
}

function getProjectsByTableState() {
  const offset = (tableState.page - 1) * tableState.limit;

  switch (tableState.view) {
    case "favorites":
      return getFavoriteProjects(tableState.limit, offset, tableState.search);
    case "archived":
      return getArchivedProjects(tableState.limit, offset, tableState.search);
    default:
      return getProjects(
        "projects",
        tableState.limit,
        offset,
        tableState.search,
      );
  }
}

function updatePagination(loadedProjectCount) {
  pageInformation.textContent = `Página ${tableState.page}`;
  previousPageButton.disabled = tableState.page === 1;
  nextPageButton.disabled = loadedProjectCount < tableState.limit;
}

function renderProjects(loadedProjects) {
  tableBody.replaceChildren();

  loadedProjects.forEach((project) => {
    tableBody.append(createProjectRow(project));
  });
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
  const cell = document.createElement("td");
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
  button.textContent = `${project[configuration.countProperty]} ${configuration.countLabel}`;
  button.addEventListener("click", async () => {
    const items = await configuration.loadItems(project.id);

    const formattedItems = items.map((item) => {
      return configuration.formatItem(item);
    });

    showDetailCard(
      row,
      configuration.title,
      formattedItems,
      project.id,
      contentType,
    );
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
  openedDetailCard?.remove();

  const projectUrl = `./pages/project.html?id=${projectId}`;
  const detailCard = createDetailCard(title, items, projectUrl, contentType);
  const cardTop = tableTitles.offsetTop + row.offsetTop;

  projectsTable.append(detailCard);
  detailCard.style.top = `${cardTop}px`;
  openedDetailCard = detailCard;
}

function changeProjectView(view) {
  tableState.view = view;
  tableState.page = 1;
  loadProjects();
}

await renderProfileHeader();

recordsPerPageSelect.addEventListener("change", () => {
  tableState.limit = Number(recordsPerPageSelect.value);
  tableState.page = 1;
  loadProjects();
});

previousPageButton.addEventListener("click", async () => {
  if (tableState.page === 1) {
    return;
  }

  tableState.page--;
  await loadProjects();
  window.scrollTo(0, 0);
});

nextPageButton.addEventListener("click", async () => {
  tableState.page++;
  await loadProjects();
  window.scrollTo(0, 0);
});

loadProjects();

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    tableState.search = searchInput.value.trim().toLowerCase();
    tableState.page = 1;
    loadProjects();
  }, 500);
});

createNewProjectButton.addEventListener("click", () => {
  window.location.href = "./pages/new-project.html";
});

createNewClientButton.addEventListener("click", () => {
  window.location.href = "./pages/new-client.html";
});

showArchivedButton.addEventListener("click", () => {
  changeProjectView("archived");
});

showActiveButton.addEventListener("click", () => {
  changeProjectView("active");
});

showFavoritesButton.addEventListener("click", () => {
  changeProjectView("favorites");
});
