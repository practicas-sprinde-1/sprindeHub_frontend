import { checkToken } from "../api/session.js";
import { createHeader } from "../components/header.js";
import { createDetailCard } from "../components/detail-card.js";
import { getArchivedProjects, getProjects } from "../api/project.api.js";
import { getEnvironmentsByProjectId } from "../api/environment.api.js";
import { getRepositoriesByProjectId } from "../api/repository.api.js";
import { getServicesByProjectId } from "../api/service.api.js";
import { getDomainsByProjectId } from "../api/domain.api.js";
import { getCommandsByProjectId } from "../api/command.api.js";
import { getLinksByProjectId } from "../api/link.api.js";
import { getNotesByProjectId } from "../api/note.api.js";
// checkToken();

//Devuelve el primer elemento que tenga ese #id o .clase
const headerContainer = document.querySelector("#header-container");

const header = createHeader("César", "./pages/profile.html");

headerContainer.append(header);

const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");
const searchInput = document.querySelector("#input-index");
const showArchivedButton = document.querySelector("#archived-projects");
const showActivedButton = document.querySelector("#actived-projects");

let currentPage = 1;
let recordsPerPage = Number(recordsPerPageSelect.value);

function showTableRows() {
  const tableRows = document.querySelectorAll("#projects-table-body tr");

  const firstRow = (currentPage - 1) * recordsPerPage;
  const lastRow = firstRow + recordsPerPage;

  tableRows.forEach(function (row, index) {
    row.hidden = index < firstRow || index >= lastRow;
  });

  const totalPages = Math.ceil(tableRows.length / recordsPerPage);

  pageInformation.textContent = "Página " + currentPage + " de " + totalPages;

  previousPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
}

recordsPerPageSelect.addEventListener("change", () => {
  recordsPerPage = Number(recordsPerPageSelect.value);
  currentPage = 1;

  showTableRows();
});

previousPageButton.addEventListener("click", () => {
  if (currentPage === 1) return;
  currentPage = currentPage - 1;

  showTableRows();
});

nextPageButton.addEventListener("click", () => {
  if (projects.length < 0) return;
  currentPage = currentPage + 1;

  showTableRows();
});

const projectsTableRead = await getProjects();

let projects = projectsTableRead.items;

const tableBody = document.querySelector("#projects-table-body");
const projectsTable = document.querySelector(".projects-table");
const tableTitles = document.querySelector(".table-titles");

function renderTable(projects) {
  tableBody.replaceChildren();

  projects.forEach(async (project) => {
    // Creamos la fila
    const row = document.createElement("tr");

    // Cliente
    const clientCell = document.createElement("td");
    const clientName = document.createElement("strong");
    clientName.textContent = project.client.name;
    clientCell.append(clientName);

    // Proyecto
    const projectCell = document.createElement("td");
    const projectLink = document.createElement("a");
    projectLink.classList.add("project-link");
    projectLink.href = `./pages/project.html?id=${project.id}`;
    projectLink.textContent = project.name;
    projectCell.append(projectLink);

    // Entornos
    const environmentsCell = document.createElement("td");
    environmentsCell.classList.add("cell-centered");

    const environments = project.environments;

    environments.forEach((environment) => {
      const environmentLabel = document.createElement("span");

      environmentLabel.classList.add("environment");
      environmentLabel.classList.add(`environment--${environment.type}`);
      environmentLabel.textContent = environment.type;

      environmentsCell.append(environmentLabel);
    });

    // Repositorios
    const repositoriesCell = document.createElement("td");
    repositoriesCell.classList.add("cell-centered");
    repositoriesCell.classList.add("repositories-cell");

    const repositories = project.repositories;

    repositories.forEach((repository) => {
      const repositoryLink = document.createElement("a");

      repositoryLink.href = repository.url;
      repositoryLink.textContent = repository.type;

      repositoriesCell.append(repositoryLink);
    });

    // Servicios
    const servicesCell = document.createElement("td");
    servicesCell.classList.add("cell-centered");

    const services = project.services;

    services.forEach((service) => {
      const serviceTag = document.createElement("span");

      serviceTag.classList.add("tag");
      serviceTag.textContent = service.name;

      servicesCell.append(serviceTag);
    });

    // Dominios
    const domainsCell = document.createElement("td");
    domainsCell.classList.add("cell-centered");

    const domains = project.domains;

    domains.forEach((domain) => {
      const domainLink = document.createElement("a");

      domainLink.classList.add("domain-link");
      domainLink.href = `https://${domain.url}`;
      //El enlace se abre en una pestaña nueva
      domainLink.target = "_blank";
      domainLink.textContent = domain.url;

      domainsCell.append(domainLink);
    });

    //Comandos

    const commandsCell = document.createElement("td");
    commandsCell.classList.add("cell-centered");

    const commandsButton = document.createElement("button");
    commandsButton.classList.add("table-count-button");
    commandsButton.type = "button";
    commandsButton.textContent = `${project.commands_count} comandos`;

    commandsButton.addEventListener("click", async () => {
      const commands = await getCommandsByProjectId(project.id);

      const commandTexts = commands.map((command) => {
        return {
          name: command.name,
          instruction: command.instruction,
        };
      });

      showDetailCard(row, "Comandos", commandTexts, project.id, "commands");
    });

    commandsCell.append(commandsButton);

    //Links

    const linksCell = document.createElement("td");
    linksCell.classList.add("cell-centered");

    const linksButton = document.createElement("button");
    linksButton.classList.add("table-count-button");
    linksButton.type = "button";
    linksButton.textContent = `${project.links_count} enlaces`;

    linksButton.addEventListener("click", async () => {
      const links = await getLinksByProjectId(project.id);

      const linksText = links.map((link) => {
        return {
          title: link.title,
          url: link.url,
        };
      });

      showDetailCard(row, "Documentación", linksText, project.id, "links");
    });

    linksCell.append(linksButton);

    //Notas

    const notesCell = document.createElement("td");
    notesCell.classList.add("cell-centered");

    const notesButton = document.createElement("button");
    notesButton.classList.add("table-count-button");
    notesButton.type = "button";
    notesButton.textContent = `${project.notes_count} notas`;

    notesButton.addEventListener("click", async () => {
      const notes = await getNotesByProjectId(project.id);

      const notesText = notes.map((note) => {
        return {
          description: note.description,
          content: note.content,
        };
      });

      showDetailCard(row, "Notas", notesText, project.id, "notes");
    });

    notesCell.append(notesButton);

    // Introducimos todas las celdas en la fila
    row.append(
      clientCell,
      projectCell,
      environmentsCell,
      repositoriesCell,
      servicesCell,
      domainsCell,
      commandsCell,
      linksCell,
      notesCell,
    );

    // Introducimos la fila en la tabla
    tableBody.append(row);
  });
}
renderTable(projects);
showTableRows();
searchInput.addEventListener("input", () => {
  const searched = searchInput.value.trim().toLowerCase();

  const filteredProjects = projects.filter((project) => {
    const client = project.client.name.toLowerCase();
    const projectName = project.name.toLowerCase();

    return client.includes(searched) || projectName.includes(searched);
  });
  currentPage = 1;
  renderTable(filteredProjects);
  showTableRows();
});

const createNewProjectButton = document.querySelector("#button-new-project");

createNewProjectButton.addEventListener("click", () => {
  window.location.href = "./pages/new-project.html";
});

const createNewClientButton = document.querySelector("#button-new-client");

createNewClientButton.addEventListener("click", () => {
  window.location.href = "./pages/new-client.html";
});

let openedDetailCard;

function showDetailCard(row, title, items, projectId, contentType) {
  if (openedDetailCard) {
    openedDetailCard.remove();
  }

  const projectUrl = `./pages/project.html?id=${projectId}`;

  const detailCard = createDetailCard(title, items, projectUrl, contentType);

  projectsTable.append(detailCard);
  // Sitúa la tarjeta a la misma altura que la fila que abrió el detalle.
  const tableTop = tableTitles.offsetTop;
  const rowTop = row.offsetTop;
  const cardTop = tableTop + rowTop;

  detailCard.style.top = `${cardTop}px`;

  openedDetailCard = detailCard;
}

showArchivedButton.onclick = async () => {
  const archivedProjects = await getArchivedProjects();

  projects = archivedProjects.items;
  renderTable(projects);
};

showActivedButton.onclick = async () => {
  projects = projectsTableRead.items;
  renderTable(projects);
};
