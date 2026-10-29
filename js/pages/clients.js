import { getArchivedClients, getClients } from "../api/client.api.js";
import { getProjectByClientId } from "../api/project.api.js";
import { createHeader } from "../components/header.js";
document
  .querySelector("#header-container")
  .append(createHeader("César", "./profile.html"));

const tableBody = document.querySelector("#clients-table-body");
const searchInput = document.querySelector("#input-clients");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");

const showArchivedButton = document.querySelector("#archived-clients");
const showActivedButton = document.querySelector("#actived-clients");

let clients = [];
let tableState = {
  search: "",
  page: 1,
  limit: Number(recordsPerPageSelect.value),
  view: "active",
};

async function renderTable(clients) {
  const rows = [];

  for (const client of clients) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const clientLink = document.createElement("a");
    clientLink.className = "client-link";
    clientLink.href = `./client.html?id=${client.id}`;
    clientLink.textContent = client.name;
    nameCell.append(clientLink);

    const cifCell = document.createElement("td");
    cifCell.textContent = client.cif;

    const phoneCell = document.createElement("td");
    phoneCell.textContent = client.phone;

    const projectsCell = document.createElement("td");
    projectsCell.className = "client-projects";

    const projectsResponse = await getProjectByClientId(client.id);
    const projectsByClient = projectsResponse.items ?? projectsResponse;

    projectsByClient.forEach((project) => {
      const projectLink = document.createElement("a");
      projectLink.className = "project-link";
      projectLink.href = `./project.html?id=${project.id}`;
      projectLink.textContent = project.name;
      projectsCell.append(projectLink);
    });

    const statusCell = document.createElement("td");
    statusCell.className = "cell-centered";
    const status = document.createElement("span");
    status.className = `status status--${client.is_active ? "active" : "inactive"}`;
    status.textContent = client.is_active ? "Activo" : "Inactivo";
    statusCell.append(status);

    row.append(nameCell, cifCell, phoneCell, projectsCell, statusCell);
    rows.push(row);
  }

  tableBody.replaceChildren(...rows);
}

async function loadClients() {
  const offset = (tableState.page - 1) * tableState.limit;
  let response;

  if (tableState.view === "archived") {
    response = await getArchivedClients(
      tableState.limit,
      offset,
      tableState.search,
    );
  } else {
    response = await getClients(
      "clients",
      tableState.limit,
      offset,
      tableState.search,
    );
  }
  clients = response.items;
  await renderTable(clients);
  pageInformation.textContent = "Página " + tableState.page;
  previousPageButton.disabled = tableState.page === 1;
  nextPageButton.disabled = clients.length < tableState.limit;
}
await loadClients();

let timeOut;

searchInput.addEventListener("input", () => {
  clearTimeout(timeOut);

  timeOut = setTimeout(() => {
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
  if (tableState.page > 1) {
    tableState.page--;
    await loadClients();
    window.scrollTo(0, 0);
  }
});
nextPageButton.addEventListener("click", async () => {
  tableState.page++;
  await loadClients();
  window.scrollTo(0, 0);
});
document.querySelector("#button-new-client").addEventListener("click", () => {
  window.location.href = "./new-client.html";
});

showArchivedButton.onclick = () => {
  tableState.view = "archived";
  tableState.page = 1;
  loadClients();
};

showActivedButton.onclick = () => {
  tableState.view = "active";
  tableState.page = 1;
  loadClients();
};
