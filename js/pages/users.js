import { createHeader } from "../components/header.js";
import { createPaginatedTable } from "../components/paginated-table.js";
import { createNewUserModal } from "../features/user-create-modal.js";
import { createEditUserModal } from "../features/user-edit-modal.js";
import { createConfirmModal } from "../features/confirm-modal.js";
import { deleteUser, getUsers } from "../api/user.api.js";
import { showNotification } from "../components/notifications.js";
import { getProfile } from "../api/profile.api.js";

const ADMIN_ROLE = "ADMIN";

const currentUser = await getProfile();

const headerContainer = document.querySelector("#header-container");
const tableBody = document.querySelector("#users-table-body");
const tableStatusMessage = document.querySelector("#users-status");
const searchInput = document.querySelector("#input-users");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");
const createUserButton = document.querySelector("#button-new-user");
const editUserButton = document.querySelector("#button-edit-user");
const deleteUserButton = document.querySelector("#button-delete-user");

let selectedUser = null;

function configureHeader() {
  const header = createHeader(currentUser.username, "./profile.html");
  headerContainer.append(header);
}

function checkAdministratorAccess() {
  if (currentUser.role === ADMIN_ROLE) {
    return;
  }

  showNotification({
    type: "error",
    title: "Acceso no autorizado",
    message: "No tienes acceso a esta página. Contacta con un administrador.",
    duration: 5000,
  });

  createUserButton.disabled = true;
  editUserButton.disabled = true;
  deleteUserButton.disabled = true;

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1500);
}

function createTableCell(content, className) {
  const cell = document.createElement("td");
  cell.textContent = content;

  if (className) {
    cell.className = className;
  }

  return cell;
}

function createRoleCell(roleName) {
  const cell = document.createElement("td");
  cell.className = "cell-centered";

  const roleLabel = document.createElement("span");
  roleLabel.className = "role";
  roleLabel.textContent = roleName;
  cell.append(roleLabel);

  return cell;
}

function createStatusCell(isActive) {
  const cell = document.createElement("td");
  cell.className = "cell-centered";

  const status = document.createElement("span");
  status.className = `status status--${isActive ? "active" : "inactive"}`;
  status.textContent = isActive ? "Activo" : "Inactivo";
  cell.append(status);

  return cell;
}

function createUserRow(userRecord) {
  const row = document.createElement("tr");

  if (userRecord === selectedUser) {
    row.classList.add("user-row-selected");
  }

  row.addEventListener("click", () => selectUser(userRecord, row));
  row.append(
    createTableCell(userRecord.id, "cell-centered"),
    createTableCell(userRecord.email),
    createTableCell(userRecord.username),
    createRoleCell(userRecord.role),
    createStatusCell(userRecord.is_active),
  );

  return row;
}

function selectUser(userRecord, row) {
  const previouslySelectedRow = tableBody.querySelector(".user-row-selected");
  previouslySelectedRow?.classList.remove("user-row-selected");

  selectedUser = userRecord;
  row.classList.add("user-row-selected");
}

async function loadUsersPage(request) {
  const users = await getUsers(
    "users",
    request.limit,
    request.offset,
    request.search,
  );

  // GET /admin/users devuelve una lista, sin total de registros.
  return { items: users };
}

function clearUserSelection() {
  selectedUser = null;
  const selectedRow = tableBody.querySelector(".user-row-selected");
  selectedRow?.classList.remove("user-row-selected");
}

function loadUsers() {
  return usersTable.load();
}

function hasOpenModal() {
  return document.querySelector(".modal-overlay") !== null;
}

function notifyMissingSelection(action) {
  showNotification({
    type: "info",
    title: "Selecciona un usuario",
    message: `Selecciona un usuario de la tabla antes de ${action}.`,
  });
}

function openCreateUserModal() {
  if (hasOpenModal()) {
    return;
  }

  const modal = createNewUserModal(loadUsers);
  document.body.append(modal);
}

async function openEditUserModal() {
  if (hasOpenModal()) {
    return;
  }

  if (selectedUser === null) {
    notifyMissingSelection("modificarlo");
    return;
  }

  const modal = await createEditUserModal(selectedUser, loadUsers);
  document.body.append(modal);
}

function openDeleteUserConfirmation() {
  const hasOpenConfirmation =
    document.querySelector(".confirm-overlay") !== null;

  if (hasOpenModal() || hasOpenConfirmation) {
    return;
  }

  if (selectedUser === null) {
    notifyMissingSelection("borrarlo");
    return;
  }

  const confirmModal = createConfirmModal(
    "Borrar usuario",
    `¿Estás seguro de que deseas borrar el usuario "${selectedUser.username}"?`,
    async () => {
      await deleteUser(selectedUser.id);
      loadUsers();
      showNotification({
        type: "success",
        title: "Usuario borrado",
        message: "El usuario se ha borrado correctamente.",
      });
    },
  );

  document.body.append(confirmModal);
}

function registerEventListeners() {
  createUserButton.addEventListener("click", openCreateUserModal);
  editUserButton.addEventListener("click", openEditUserModal);
  deleteUserButton.addEventListener("click", openDeleteUserConfirmation);
}

const usersTable =
  currentUser.role === ADMIN_ROLE
    ? createPaginatedTable({
        tableBody,
        searchInput,
        recordsPerPageSelect,
        previousPageButton,
        nextPageButton,
        pageInformation,
        loadPage: loadUsersPage,
        createRow: createUserRow,
        errorTitle: "No se han podido cargar los usuarios",
        onLoad: () => {
          clearUserSelection();
          showTableStatus("Cargando usuarios...");
        },
        onLoadEnd: () => showTableStatus(""),
      })
    : null;

configureHeader();
checkAdministratorAccess();

if (currentUser.role === ADMIN_ROLE) {
  registerEventListeners();
  await loadUsers();
}

function showTableStatus(message) {
  tableStatusMessage.textContent = message;
  tableStatusMessage.hidden = !message;
}
