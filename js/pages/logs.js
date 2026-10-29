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

let logs = [];
const users = await getUsers("users", 100, 0);
let tableState = {
  search: "",
  page: 1,
  limit: Number(recordsPerPageSelect.value),
};

async function renderTable(logs, users) {
  const rows = [];

  for (const log of logs) {
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

    if (log.affected_entity === "CLIENT" && entity !== null) {
      const clientLink = document.createElement("a");
      clientLink.href = `./client.html?id=${entity.id}`;
      clientLink.className = "project-link";
      clientLink.textContent = entity.name;
      linksCell.append(clientLink);
    }

    if (log.affected_entity === "PROJECT" && entity !== null) {
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
    rows.push(row);
  }

  tableBody.replaceChildren(...rows);
}

async function loadLogs() {
  const offset = (tableState.page - 1) * tableState.limit;
  logs = await getLogs(
    "logs",
    tableState.limit,
    offset,
    tableState.search,
  );
  await renderTable(logs, users);
  pageInformation.textContent = "Página " + tableState.page;
  previousPageButton.disabled = tableState.page === 1;
  nextPageButton.disabled = logs.length < tableState.limit;
}
await loadLogs();

let timeOut;

searchInput.addEventListener("input", async () => {
  clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    tableState.search = searchInput.value.trim().toLowerCase();
    tableState.page = 1;
    loadLogs();
  }, 500);
});
recordsPerPageSelect.addEventListener("change", () => {
  tableState.limit = Number(recordsPerPageSelect.value);
  tableState.page = 1;
  loadLogs();
});
previousPageButton.addEventListener("click", async () => {
  if (tableState.page > 1) {
    tableState.page--;
    await loadLogs();
    window.scrollTo(0, 0);
  }
});
nextPageButton.addEventListener("click", async () => {
  tableState.page++;
  await loadLogs();
  window.scrollTo(0, 0);
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
