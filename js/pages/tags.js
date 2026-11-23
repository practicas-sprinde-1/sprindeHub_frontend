import { deleteTag, getTags } from "../api/tag.api.js";
import { getClientById, getLightClients } from "../api/client.api.js";
import { createHeader } from "../components/header.js";
import { createPaginatedTable } from "../components/paginated-table.js";
import { openNewClientModal } from "../features/client-create-modal.js";
import { openNewTagModal } from "../features/tag-create-modal.js";
import { createEditTagModal } from "../features/tag-edit-modal.js";
import { createConfirmModal } from "../features/confirm-modal.js";
import { showNotification } from "../components/notifications.js";

const headerContainer = document.querySelector("#header-container");
const tableBody = document.querySelector("#tags-table-body");
const tableStatusMessage = document.querySelector("#tags-status");
const searchInput = document.querySelector("#input-tags");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");
const createTagButton = document.querySelector("#button-new-tag");
const editTagButton = document.querySelector("#button-edit-tag");
const deleteTagButton = document.querySelector("#button-delete-tag");
const createClientButton = document.querySelector("#button-new-client");

let selectedTag = null;
let isLoadingTags = false;
let isTagActionInProgress = false;

configureHeader();

const tagsTable = createPaginatedTable({
  tableBody,
  searchInput,
  recordsPerPageSelect,
  previousPageButton,
  nextPageButton,
  pageInformation,
  loadPage: loadTagsPage,
  createRow: createTagRow,
  errorTitle: "Error al cargar los dispositivos",
  onLoad: () => {
    isLoadingTags = true;
    updateTagActionButtons();
    clearTagSelection();
    showTableStatus("Cargando dispositivos...");
  },
  onLoadEnd: () => {
    isLoadingTags = false;
    updateTagActionButtons();
  },
});

registerEventListeners();
await loadTags();

function configureHeader() {
  const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "null");
  const header = createHeader(currentUser.username, "./profile.html");
  headerContainer.append(header);
}

function registerEventListeners() {
  createClientButton.addEventListener("click", openCreateClientModal);
  createTagButton.addEventListener("click", openCreateTagModal);
  editTagButton.addEventListener("click", openEditTagModal);
  deleteTagButton.addEventListener("click", openDeleteTagConfirmation);
}

function loadTags() {
  return tagsTable.load();
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

function refreshTagsAfterCreate() {
  searchInput.value = "";
  return tagsTable.setFilters({});
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
  row.tabIndex = 0;
  row.addEventListener("click", () => selectTag(tag, row));
  row.append(
    createClientLinkCell(tag.client),
    createCenteredTextCell(tag.tag_type),
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

function selectTag(tag, row) {
  if (isLoadingTags) {
    return;
  }

  clearTagSelection();
  selectedTag = tag;
  row.classList.add("tag-row-selected");
}

function clearTagSelection() {
  selectedTag = null;
  const selectedRow = tableBody.querySelector(".tag-row-selected");
  selectedRow?.classList.remove("tag-row-selected");
}

function updateTagActionButtons() {
  const shouldDisableTagActions = isLoadingTags || isTagActionInProgress;
  editTagButton.disabled = shouldDisableTagActions;
  deleteTagButton.disabled = shouldDisableTagActions;
}

function hasOpenModal() {
  const openModal = document.querySelector(
    ".modal-overlay, .confirm-overlay, dialog[open]",
  );
  return openModal !== null;
}

function notifyMissingSelection(actionDescription) {
  showNotification({
    type: "info",
    title: "Selecciona un dispositivo",
    message: `Selecciona una fila de la tabla antes de ${actionDescription} el dispositivo.`,
  });
}

function openCreateTagModal() {
  if (isTagActionInProgress || hasOpenModal()) {
    return;
  }

  openNewTagModal(refreshTagsAfterCreate);
}

function openCreateClientModal() {
  if (isTagActionInProgress || hasOpenModal()) {
    return;
  }

  openNewClientModal();
}

function openEditTagModal() {
  if (isLoadingTags || isTagActionInProgress || hasOpenModal()) {
    return;
  }

  if (selectedTag === null) {
    notifyMissingSelection("modificar");
    return;
  }

  const editModal = createEditTagModal(selectedTag, loadTags);
  document.body.append(editModal);
  editModal.showModal();
}

function openDeleteTagConfirmation() {
  if (isLoadingTags || isTagActionInProgress || hasOpenModal()) {
    return;
  }

  if (selectedTag === null) {
    notifyMissingSelection("borrar");
    return;
  }

  const tagIdToDelete = selectedTag.id;
  const tagType = selectedTag.tag_type || "Sin tipo";
  const confirmModal = createConfirmModal(
    "Borrar dispositivo",
    `¿Estás seguro de que deseas borrar el dispositivo "${tagType}" (ID ${tagIdToDelete})?`,
    async () => {
      // El bloqueo cubre el borrado y la recarga de la tabla.
      isTagActionInProgress = true;
      updateTagActionButtons();

      try {
        await deleteTag(tagIdToDelete);
        await loadTags();
        showNotification({
          type: "success",
          title: "Dispositivo borrado",
          message: "El dispositivo se ha borrado correctamente.",
        });
      } finally {
        isTagActionInProgress = false;
        updateTagActionButtons();
      }
    },
  );

  document.body.append(confirmModal);
}
