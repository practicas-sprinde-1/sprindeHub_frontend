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

let currentPage = 1;
let recordsPerPage = Number(recordsPerPageSelect.value);

const clientsResponse = await getClients("clients", 20, 0);
let clients = clientsResponse.items ?? clientsResponse;
const archivedClients = await getArchivedClients();

function renderTable(clients) {
  tableBody.replaceChildren();

  clients.forEach(async (client) => {
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

renderTable(clients);
showTableRows();

searchInput.addEventListener("input", () => {
  const searched = searchInput.value.trim().toLowerCase();
  const filteredClients = clients.filter((client) => {
    const name = client.name.toLowerCase();
    const cif = client.cif.toLocaleLowerCase();
    return name.includes(searched) || cif.includes(searched);
  });

  currentPage = 1;
  renderTable(filteredClients);
  showTableRows();
});
recordsPerPageSelect.addEventListener("change", async () => {
  recordsPerPage = Number(recordsPerPageSelect.value);
  currentPage = 1;
  const response = await getClients(
    "clients",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );
  clients = response.items;
  renderTable(clients);
  showTableRows();
});
previousPageButton.addEventListener("click", async () => {
  currentPage -= 1;
  clients = await getClients(
    "clients",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );
  showTableRows();
});
nextPageButton.addEventListener("click", async () => {
  currentPage += 1;
  clients = await getClients(
    "clients",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );
  showTableRows();
});
document.querySelector("#button-new-client").addEventListener("click", () => {
  window.location.href = "./new-client.html";
});

showArchivedButton.onclick = async () => {
  clients = archivedClients.items;
  renderTable(clients);
};

showActivedButton.onclick = async () => {
  clients = clientsResponse.items;
  renderTable(clients);
};
