import { createHeader } from "../components/header.js";
import { clientMockData } from "../mockdata/client.mockdata.js";
import { projectsByClientIdMockData } from "../mockdata/projectsByClientId.mockdata.js";

const headerContainer = document.querySelector("#header-container");
headerContainer.append(createHeader("César", "./profile.html"));

const clientDetail = document.querySelector("#client-detail");
const clientError = document.querySelector("#client-error");

const searchParams = new URLSearchParams(window.location.search);

const clientId = Number(searchParams.get("id"));

const client = clientMockData.id === clientId ? clientMockData : null;

if (!Number.isInteger(clientId) || clientId < 1 || !client) {
  clientError.hidden = false;
  clientError.textContent =
    "Ha ocurrido algún error con este cliente. Inténtelo de nuevo más tarde";
} else {
  renderClient(client);
  clientDetail.hidden = false;
}

function renderClient(client) {
  document.title = `${client.name} - Sprinde`;

  document.querySelector("#client-title").textContent = client.name;
  const status = document.querySelector("#client-status");

  status.textContent = client.is_active ? "Activo" : "Inactivo";

  status.classList.toggle("client-status--active", client.is_active);
  status.classList.toggle("client-status--inactive", !client.is_active);

  const projectsList = document.querySelector("#client-list-projects");
  const projects = projectsByClientIdMockData.items;

  projects.forEach((project) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");

    link.href = `./project.html?id=${project.id}`;
    link.textContent = project.name;

    listItem.append(link);
    projectsList.append(listItem);
  });
  document.querySelector("#client-cif").textContent = client.cif;
  document.querySelector("#client-phone").textContent = client.phone;
}
