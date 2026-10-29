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

let currentPage = 1;
let recordsPerPage = Number(recordsPerPageSelect.value);
let selectedUser = null;
let search = "";
let users = await getUsers("users", 20, 0);

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

function showTableRows() {
  const rows = tableBody.querySelectorAll("tr");

  const firstRow = (currentPage - 1) * recordsPerPage;
  const lastRow = firstRow + recordsPerPage;

  rows.forEach(function (row, index) {
    row.hidden = index < firstRow || index >= lastRow;
  });

  pageInformation.textContent = "Página " + currentPage;
  previousPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = users.length !== recordsPerPage;
}
let timeOut;
async function showUsers() {
  clearTimeout(timeOut);
  timeOut = setTimeout(async () => {
    if (!users.includes(selectedUser)) {
      selectedUser = null;
    }

    search = searchInput.value.trim().toLowerCase();
    const filteredUsers = await getUsers("users", 100, 0, search);
    renderTable(filteredUsers);
    showTableRows();
  }, 250);
}

searchInput.addEventListener("input", showUsers);

recordsPerPageSelect.addEventListener("change", async () => {
  if (search !== "") {
    return;
  }
  recordsPerPage = Number(recordsPerPageSelect.value);
  currentPage = 1;
  users = await getUsers(
    "users",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );

  showTableRows();
});

previousPageButton.addEventListener("click", async () => {
  currentPage = currentPage - 1;
  users = await getUsers(
    "users",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );

  showTableRows();
});

nextPageButton.addEventListener("click", async () => {
  currentPage = currentPage + 1;
  users = await getUsers(
    "users",
    recordsPerPage,
    (currentPage - 1) * recordsPerPage,
  );
  showTableRows();
});

createUserButton.addEventListener("click", () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  const modal = createNewUserModal(showUsers);
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

  const modal = await createEditUserModal(selectedUser, showUsers);
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
      showUsers();
      showNotification({
        type: "success",
        title: "Usuario borrado",
        message: "El usuario se ha borrado correctamente.",
      });
    },
  );

  document.body.append(confirmModal);
});

showUsers();
