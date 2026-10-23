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

document
  .querySelector("#header-container")
  .append(createHeader("César", "./profile.html"));

const tableBody = document.querySelector("#logs-table-body");
const searchInput = document.querySelector("#input-logs");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");

let currentPage = 1;
let recordsPerPage = Number(recordsPerPageSelect.value);

const logs = await getLogs();
const users = await getUsers();

function renderTable(logs, users) {
  tableBody.replaceChildren();

  logs.forEach(async (log) => {
    const row = document.createElement("tr");
    const userCell = document.createElement("td");
    const user = users.find((user) => user.id === log.user_id);
    userCell.textContent = user.username;

    const actionCell = document.createElement("td");
    actionCell.textContent = log.action;

    const typeEntityCell = document.createElement("td");
    typeEntityCell.textContent = log.affected_entity;

    const entity = await findEntity(
      log.affected_entity,
      log.affected_entity_id,
    );

    const entityCell = document.createElement("td");

    if (entity.name) {
      entityCell.textContent = entity.name;
    }
    if (entity.url) {
      entityCell.textContent = entity.url;
    }
    if (entity.description) {
      entityCell.textContent = entity.description;
    }

    const projectCell = document.createElement("td");
    let project;
    if (entity.project_id) {
      project = await findEntity("PROJECT", entity.project_id);
      const projectLink = document.createElement("a");
      projectLink.href = projectCell.textContent = project.name;
    }
    const dateCell = document.createElement("td");
    dateCell.textContent = log.created_at;

    row.append(
      userCell,
      actionCell,
      typeEntityCell,
      entityCell,
      dateCell,
      projectCell,
    );
    tableBody.append(row);
  });
}

function showTableRows() {
  const rows = [...tableBody.querySelectorAll("tr")];
  const totalPages = Math.max(1, Math.ceil(rows.length / recordsPerPage));
  currentPage = Math.min(currentPage, totalPages);

  rows.forEach((row, index) => {
    row.hidden =
      index < (currentPage - 1) * recordsPerPage ||
      index >= currentPage * recordsPerPage;
  });

  pageInformation.textContent = `Página ${currentPage} de ${totalPages}`;
  previousPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
}

renderTable(logs, users);
showTableRows();

let cooldown;

searchInput.addEventListener("input", async () => {
  clearTimeout(cooldown);
  cooldown = setTimeout(async () => {
    const searched = searchInput.value.toLowerCase();
    const filteredLogs = [];

    for (const log of logs) {
      const user = users.find((user) => user.id === log.user_id);

      let username;
      if (user) {
        username = user.username;
      }

      const action = log.action.toLowerCase();
      const typeEntity = log.affected_entity.toLowerCase();
      const date = log.created_at;

      const entity = await findEntity(
        log.affected_entity,
        log.affected_entity_id,
      );
      const entityName = entity.name.toLowerCase();

      const entityUrl = entity.url;

      if (
        username.includes(searched) ||
        action.includes(searched) ||
        typeEntity.includes(searched) ||
        entityName.includes(searched) ||
        entityUrl?.includes(searched) ||
        date.includes(searched)
      ) {
        console.log(filteredLogs);
        filteredLogs.push(log);
      }
    }

    currentPage = 1;
    renderTable(filteredLogs, users);
    showTableRows();
  }, 500);
});
recordsPerPageSelect.addEventListener("change", () => {
  recordsPerPage = Number(recordsPerPageSelect.value);
  currentPage = 1;
  showTableRows();
});
previousPageButton.addEventListener("click", () => {
  currentPage -= 1;
  showTableRows();
});
nextPageButton.addEventListener("click", () => {
  currentPage += 1;
  showTableRows();
});

export async function findEntity(entity, id) {
  switch (entity) {
    case "CLIENT":
      return await getClientById(id);
    case "PROJECT":
      return await getProjectById(id);
    case "COMMAND":
      return await getCommandById(id);
    case "DOMAIN":
      return await getDomainById(id);
    case "ENVIRONMENT":
      return await getEnvironmentById(id);
    case "LINK":
      return await getLinkById(id);
    case "NOTE":
      return await getNoteById(id);
    case "REPOSITORY":
      return await getRepositoryById(id);
    case "SERVICE":
      return await getServiceById(id);
  }
}
