import { createHeader } from "../components/header.js";
import { createConfirmModal } from "../components/confirm-modal.js";
import { createEditModalClient } from "../components/client-edit-modal.js";
import { getClientById, deleteClientById } from "../api/client.api.js";
import { getProjectByClientId } from "../api/project.api.js";
import { showNotification } from "../components/notifications.js";

const headerContainer = document.querySelector("#header-container");
headerContainer.append(createHeader("César", "./profile.html"));

const clientDetail = document.querySelector("#client-detail");
const clientError = document.querySelector("#client-error");

const searchParams = new URLSearchParams(window.location.search);

const clientId = Number(searchParams.get("id"));

const client = await getClientById(clientId);

if (!Number.isInteger(clientId) || clientId < 1 || !client) {
  clientError.hidden = false;
  clientError.textContent =
    "Ha ocurrido algún error con este cliente. Inténtelo de nuevo más tarde";
} else {
  renderClient(client);
  clientDetail.hidden = false;
}

async function renderClient(client) {
  document.title = `${client.name} - Sprinde`;

  document.querySelector("#client-title").textContent = client.name;
  const status = document.querySelector("#client-status");

  status.textContent = client.is_active ? "Activo" : "Inactivo";

  status.classList.toggle("client-status--active", client.is_active);
  status.classList.toggle("client-status--inactive", !client.is_active);

  const projectsList = document.querySelector("#client-list-projects");
  projectsList?.replaceChildren();
  const projectsResponse = await getProjectByClientId(client.id);
  const projects = projectsResponse.items;
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

  const modifyClient = document.querySelector(".button-edit-client");

  modifyClient.onclick = async () => {
    if (document.querySelector(".modal-overlay")) return;

    const modal = await createEditModalClient(client, renderClient, projects);
    document.body.append(modal);
  };

  const deleteClient = document.querySelector(".button-delete-client");
  deleteClient.onclick = () => {
    if (document.querySelector(".confirm-overlay")) return;

    const confirmModal = createConfirmModal(
      "Borrar cliente",
      `¿Estás seguro de que deseas borrar el cliente "${client.name}"?`,
      async () => {
        await deleteClientById(client.id);
        setTimeout(() => {
          window.location.href = "./clients.html";
        }, 1000);
      },
    );

    document.body.append(confirmModal);
  };
}
