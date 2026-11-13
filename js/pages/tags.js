import { getTags } from "../api/tag.api.js";
import { getClientById, getLightClients } from "../api/client.api.js";
import { createHeader } from "../components/header.js";
import { createPaginatedTable } from "../components/paginated-table.js";
import { openNewClientModal } from "../features/client-create-modal.js";
import { openNewTagModal } from "../features/tag-create-modal.js";

const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "null");
document
  .querySelector("#header-container")
  .append(createHeader(currentUser.username, "./profile.html"));

document.querySelector("#button-new-client").addEventListener("click", () => {
  openNewClientModal();
});

const tableStatusMessage = document.querySelector("#tags-status");
const searchInput = document.querySelector("#input-tags");

const tagsTable = createPaginatedTable({
  tableBody: document.querySelector("#tags-table-body"),
  searchInput,
  recordsPerPageSelect: document.querySelector("#records-per-page"),
  previousPageButton: document.querySelector("#previous-page"),
  nextPageButton: document.querySelector("#next-page"),
  pageInformation: document.querySelector("#page-information"),
  loadPage: loadTagsPage,
  createRow: createTagRow,
  errorTitle: "Error al cargar los dispositivos",
  onLoad: () => showTableStatus("Cargando dispositivos..."),
});

document.querySelector("#button-new-tag").addEventListener("click", () => {
  openNewTagModal(refreshTagsAfterCreate);
});

await tagsTable.load();

function refreshTagsAfterCreate() {
  searchInput.value = "";
  return tagsTable.setFilters({});
}

async function loadTagsPage({ limit, offset, search }) {
  try {
    const tags = await loadTagsWithClients(limit, offset, search);
    updateTableStatus(tags, search);

    return {
      items: tags,
      limit,
      offset,
    };
  } catch (error) {
    showTableStatus("No se han podido cargar los dispositivos.");
    throw error;
  }
}

async function loadTagsWithClients(limit, offset, search) {
  const tags = await getTags(limit, offset, search);
  const activeClients = await getLightClients("clients");

  const clientsById = await loadClientsForTags(tags, activeClients);

  const finalTagsList = [];

  for (const currentTag of tags) {
    const matchedClient = clientsById.get(currentTag.client_id);

    const tagWithClient = {
      ...currentTag,
      client: matchedClient,
    };

    finalTagsList.push(tagWithClient);
  }

  return finalTagsList;
}

//Método para cubrir situaciones en las que el cliente está archivado o hay demasiados clientes y getLightData no abarca a todos.
async function loadClientsForTags(tags, activeClients) {
  const clientsMap = new Map();

  for (const client of activeClients) {
    clientsMap.set(client.id, client);
  }

  const missingClientIds = [];

  for (const tag of tags) {
    const currentClientId = tag.client_id;

    const isNotInMap = !clientsMap.has(currentClientId);
    const isNotPending = !missingClientIds.includes(currentClientId);

    if (isNotInMap && isNotPending) {
      missingClientIds.push(currentClientId);
    }
  }

  for (const missingId of missingClientIds) {
    const missingClient = await getClientById(missingId);

    clientsMap.set(missingClient.id, missingClient);
  }

  return clientsMap;
}

function updateTableStatus(tags, search) {
  if (tags.length > 0) {
    showTableStatus("");
    return;
  }

  if (search) {
    showTableStatus("No se han encontrado dispositivos para esta búsqueda.");
    return;
  }

  showTableStatus("No hay dispositivos disponibles.");
}

function showTableStatus(message) {
  tableStatusMessage.textContent = message;
  tableStatusMessage.hidden = !message;
}

function createTagRow(tag) {
  const row = document.createElement("tr");
  row.append(
    createClientLinkCell(tag.client),
    createCenteredTextCell(tag.device_type),
    createCenteredTextCell(tag.brand),
    createCenteredTextCell(tag.model),
    createCenteredTextCell(tag.mac),
    createCenteredTextCell(tag.ip),
  );
  return row;
}

function createClientLinkCell(client) {
  const cell = document.createElement("td");
  const clientLink = document.createElement("a");
  clientLink.className = "client-link";
  clientLink.href = `./client.html?id=${client.id}`;
  clientLink.textContent = client.name;
  cell.append(clientLink);
  return cell;
}

function createCenteredTextCell(text) {
  const cell = document.createElement("td");
  cell.className = "cell-centered";
  cell.textContent = text || "—";
  return cell;
}
