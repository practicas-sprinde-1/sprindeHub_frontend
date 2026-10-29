import { createHeader } from "../components/header.js";
import { createNewUserModal } from "../components/user-create-modal.js";
import { createEditUserModal } from "../components/user-edit-modal.js";
import { createConfirmModal } from "../components/confirm-modal.js";
import { deleteUser, getUsers } from "../api/user.api.js";
import { showNotification } from "../components/notifications.js";

// Solo los administradores pueden consultar esta página.

const headerContainer = document.querySelector("#header-container");
const header = createHeader("César", "./profile.html");
headerContainer.append(header);

const tableBody = document.querySelector("#users-table-body");
const searchInput = document.querySelector("#input-users");
const recordsPerPageSelect = document.querySelector("#records-per-page");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const pageInformation = document.querySelector("#page-information");
const createUserButton = document.querySelector("#button-new-user");
const editUserButton = document.querySelector("#button-edit-user");
const deleteUserButton = document.querySelector("#button-delete-user");

let selectedUser = null;
let users = [];
let tableState = {
  search: "",
  page: 1,
  limit: Number(recordsPerPageSelect.value),
};

function renderTable(users) {
  tableBody.replaceChildren();

  for (const user of users) {
    const row = document.createElement("tr");

    if (user === selectedUser) {
      row.classList.add("user-row-selected");
    }

    row.addEventListener("click", () => {
      selectUser(user, row);
    });

    const idCell = document.createElement("td");
    idCell.className = "cell-centered";
    idCell.textContent = user.id;

    const emailCell = document.createElement("td");
    emailCell.textContent = user.email;

    const usernameCell = document.createElement("td");
    usernameCell.textContent = user.username;

    const roleCell = document.createElement("td");
    roleCell.className = "cell-centered";

    const role = document.createElement("span");
    role.className = "role";
    role.textContent = user.role;
    roleCell.append(role);

    row.append(idCell, emailCell, usernameCell, roleCell);
    tableBody.append(row);
  }
}

function selectUser(user, row) {
  const previouslySelectedRow = tableBody.querySelector(".user-row-selected");

  if (previouslySelectedRow) {
    previouslySelectedRow.classList.remove("user-row-selected");
  }

  selectedUser = user;
  row.classList.add("user-row-selected");
}

let timeOut;
async function loadUsers() {
  try {
    const offset = (tableState.page - 1) * tableState.limit;
    users = await getUsers(
      "users",
      tableState.limit,
      offset,
      tableState.search,
    );
    selectedUser = null;
    renderTable(users);
    pageInformation.textContent = "Página " + tableState.page;
    previousPageButton.disabled = tableState.page === 1;
    nextPageButton.disabled = users.length < tableState.limit;
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se han podido cargar los usuarios",
      message: error.message,
      duration: 7000,
    });
  }
}

searchInput.addEventListener("input", () => {
  clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    tableState.search = searchInput.value.trim().toLowerCase();
    tableState.page = 1;
    loadUsers();
  }, 500);
});

recordsPerPageSelect.addEventListener("change", () => {
  tableState.limit = Number(recordsPerPageSelect.value);
  tableState.page = 1;
  loadUsers();
});

previousPageButton.addEventListener("click", async () => {
  if (tableState.page > 1) {
    tableState.page--;
    await loadUsers();
    window.scrollTo(0, 0);
  }
});

nextPageButton.addEventListener("click", async () => {
  tableState.page++;
  await loadUsers();
  window.scrollTo(0, 0);
});

createUserButton.addEventListener("click", () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  const modal = createNewUserModal(loadUsers);
  document.body.append(modal);
});

editUserButton.addEventListener("click", async () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  if (selectedUser === null) {
    showNotification({
      type: "info",
      title: "Selecciona un usuario",
      message: "Selecciona un usuario de la tabla antes de modificarlo.",
    });
    return;
  }

  const modal = await createEditUserModal(selectedUser, loadUsers);
  document.body.append(modal);
});

deleteUserButton.addEventListener("click", () => {
  if (
    document.querySelector(".modal-overlay") ||
    document.querySelector(".confirm-overlay")
  ) {
    return;
  }

  if (selectedUser === null) {
    showNotification({
      type: "info",
      title: "Selecciona un usuario",
      message: "Selecciona un usuario de la tabla antes de borrarlo.",
    });
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
});

await loadUsers();
