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

let logs = await getLogs("logs", 20, 0);
const users = await getUsers();

async function renderTable(logs, users) {
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

    if (entity) {
      if (entity.name) {
        entityCell.textContent = entity.name;
      }
      if (entity.url) {
        entityCell.textContent = entity.url;
      }
      if (entity.description) {
        entityCell.textContent = entity.description;
      }
    } else {
      entityCell.textContent = "Entidad eliminada";
    }

    const linksCell = document.createElement("td");
    if (entity?.project_id) {
      const project = await findEntity("PROJECT", entity.project_id);
      if (project) {
        const projectLink = document.createElement("a");
        projectLink.href = `./project.html?id=${entity.project_id}`;
        projectLink.className = "project-link";
        projectLink.textContent = project.name;
        linksCell.append(projectLink);
      } else {
        linksCell.textContent = "Proyecto eliminado";
      }
    }

    if (log.affected_entity === "CLIENT") {
      const clientLink = document.createElement("a");
      clientLink.href = `./client.html?id=${entity.id}`;
      clientLink.className = "project-link";
      clientLink.textContent = entity.name;
      linksCell.append(clientLink);
    }

    if (log.affected_entity === "PROJECT") {
      const projectLink = document.createElement("a");
      projectLink.href = `./project.html?id=${entity.id}`;
      projectLink.className = "project-link";
      projectLink.textContent = entity.name;
      linksCell.append(projectLink);
    }

    const dateCell = document.createElement("td");
    dateCell.textContent = log.created_at;

    row.append(
      userCell,
      actionCell,
      typeEntityCell,
      entityCell,
      dateCell,
      linksCell,
    );
    tableBody.append(row);
  });
}

async function showTableRows() {
  const rows = document.querySelectorAll("#logs-table-body tr");
  const firstRow = (currentPage - 1) * recordsPerPage;
  const lastRow = firstRow + recordsPerPage;

  rows.forEach(function (row, index) {
    row.hidden = index < firstRow || index >= lastRow;
  });

  pageInformation.textContent = "Página " + currentPage;
  previousPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = logs.length !== recordsPerPage;
  await renderTable(logs, users);
}
showTableRows();

let timeOut;

searchInput.addEventListener("input", async () => {
  clearTimeout(timeOut);
  timeOut = setTimeout(async () => {
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
        filteredLogs.push(log);
      }
    }

    currentPage = 1;
    renderTable(filteredLogs, users);
  }, 500);
});
recordsPerPageSelect.addEventListener("change", async () => {
  recordsPerPage = Number(recordsPerPageSelect.value);

  currentPage = 1;
  logs = await getLogs(
    "logs",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );
  console.log(logs.length);

  showTableRows();
});
previousPageButton.addEventListener("click", async () => {
  currentPage -= 1;
  logs = await getLogs(
    "logs",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );
  showTableRows();
});
nextPageButton.addEventListener("click", async () => {
  currentPage += 1;
  logs = await getLogs(
    "logs",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );
  showTableRows();
});

export async function findEntity(entity, id) {
  try {
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
  } catch (error) {
    return null;
  }
}
