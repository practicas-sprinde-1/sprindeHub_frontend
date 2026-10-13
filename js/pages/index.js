import { checkToken } from "../api/session.js";
import { createHeader } from "../components/header.js";
import { projectsMockData } from "../mockdata/projects.mockdata.js";
import { createDetailCard } from "../components/detail-card.js";
import { getCommands } from "../mockdata/list-details.mockdata.js";
// checkToken();

//Devuelve el primer elemento que tenga ese #id o .clase
const headerContainer = document.querySelector("#header-container");

const header = createHeader("César", "./pages/profile.html");

headerContainer.append(header);

const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");

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

recordsPerPageSelect.addEventListener("change", function () {
  recordsPerPage = Number(recordsPerPageSelect.value);
  currentPage = 1;

  showTableRows();
});

previousPageButton.addEventListener("click", function () {
  currentPage = currentPage - 1;

  showTableRows();
});

nextPageButton.addEventListener("click", function () {
  currentPage = currentPage + 1;

  showTableRows();
});

const projects = projectsMockData.items;

const tableBody = document.querySelector("#projects-table-body");
const projectsTable = document.querySelector(".projects-table");
const tableTitles = document.querySelector(".table-titles");

function renderTable(projects) {
  tableBody.replaceChildren();

  projects.forEach((project) => {
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
    projectLink.href = `./pages/project/${project.id}.html`;
    projectLink.textContent = project.name;
    projectCell.append(projectLink);

    // Entornos
    const environmentsCell = document.createElement("td");
    environmentsCell.classList.add("cell-centered");

    project.environments.forEach((environment) => {
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

    project.repositories.forEach((repository) => {
      const repositoryLink = document.createElement("a");

      repositoryLink.href = repository.url;
      repositoryLink.textContent = repository.type;

      repositoriesCell.append(repositoryLink);
    });

    // Servicios
    const servicesCell = document.createElement("td");
    servicesCell.classList.add("cell-centered");

    project.services.forEach((service) => {
      const serviceTag = document.createElement("span");

      serviceTag.classList.add("tag");
      serviceTag.textContent = service.name;

      servicesCell.append(serviceTag);
    });

    // Dominios
    const domainsCell = document.createElement("td");
    domainsCell.classList.add("cell-centered");

    project.domains.forEach((domain) => {
      const domainText = document.createElement("span");
      domainText.textContent = domain.url;

      domainsCell.append(domainText);
    });

    const commandsCell = document.createElement("td");
    commandsCell.classList.add("cell-centered");

    const commandsButton = document.createElement("button");
    commandsButton.classList.add("table-count-button");
    commandsButton.type = "button";
    commandsButton.textContent = `${project.commands_count} comandos`;

    commandsButton.addEventListener("click", async () => {
      const commands = await getCommands(project.id);

      const commandTexts = commands.map((command) => {
        return `${command.name} - ${command.instruction}`;
      });

      showDetailCard(row, "Comandos", commandTexts, project.id);
    });

    commandsCell.append(commandsButton);

    // numero de Links

    const linksCell = document.createElement("td");
    linksCell.classList.add("cell-centered");
    linksCell.textContent = `${project.links_count} enlaces`;

    // numero de Notas

    const notesCell = document.createElement("td");
    notesCell.classList.add("cell-centered");
    notesCell.textContent = `${project.notes_count} notas`;

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

const searchInput = document.querySelector("#input-index");

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

let openedDetailCard = null;

function showDetailCard(row, title, items, projectId) {
  if (openedDetailCard) {
    openedDetailCard.remove();
  }

  const projectUrl = `./pages/project/${projectId}.html`;

  const detailCard = createDetailCard(title, items, projectUrl);

  projectsTable.append(detailCard);

  const tableTop = tableTitles.offsetTop;
  const rowTop = row.offsetTop;
  const cardTop = tableTop + rowTop;

  detailCard.style.top = `${cardTop}px`;

  openedDetailCard = detailCard;
}
