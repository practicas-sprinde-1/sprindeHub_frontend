import { createHeader } from "../components/header.js";
import { createNewUserModal } from "../components/create-user-modal.js";
import { createEditUserModal } from "../components/edit-user-modal.js";
import { createDeleteUserModal } from "../components/delete-user-modal.js";
import { getUsers } from "../api/user.api.js";

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
  const totalPages = Math.max(1, Math.ceil(rows.length / recordsPerPage));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const firstRow = (currentPage - 1) * recordsPerPage;
  const lastRow = firstRow + recordsPerPage;

  rows.forEach(function (row, index) {
    row.hidden = index < firstRow || index >= lastRow;
  });

  pageInformation.textContent = `Página ${currentPage} de ${totalPages}`;
  previousPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
}

async function showUsers() {
  const users = await getUsers();

  if (!users.includes(selectedUser)) {
    selectedUser = null;
  }

  const textToSearch = searchInput.value.trim().toLowerCase();
  const usersToShow = users.filter(function (user) {
    return (
      user.email.toLowerCase().includes(textToSearch) ||
      user.username.toLowerCase().includes(textToSearch) ||
      user.role.toLowerCase().includes(textToSearch)
    );
  });

  currentPage = 1;
  renderTable(usersToShow);
  showTableRows();
}

searchInput.addEventListener("input", showUsers);

recordsPerPageSelect.addEventListener("change", () => {
  recordsPerPage = Number(recordsPerPageSelect.value);
  currentPage = 1;
  showTableRows();
});

previousPageButton.addEventListener("click", () => {
  currentPage = currentPage - 1;
  showTableRows();
});

nextPageButton.addEventListener("click", () => {
  currentPage = currentPage + 1;
  showTableRows();
});

createUserButton.addEventListener("click", () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  const modal = createNewUserModal(showUsers);
  document.body.append(modal);
});

editUserButton.addEventListener("click", () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  if (selectedUser === null) {
    alert("Selecciona un usuario de la tabla antes de modificarlo.");
    return;
  }

  if (!usersMockData.includes(selectedUser)) {
    alert("El usuario seleccionado ya no está disponible.");
    selectedUser = null;
    return;
  }

  const modal = createEditUserModal(selectedUser, showUsers);
  document.body.append(modal);
});

deleteUserButton.addEventListener("click", () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  if (selectedUser === null) {
    alert("Selecciona un usuario de la tabla antes de borrarlo.");
    return;
  }

  if (!usersMockData.includes(selectedUser)) {
    alert("El usuario seleccionado ya no está disponible.");
    selectedUser = null;
    return;
  }

  const modal = createDeleteUserModal(selectedUser, showUsers);
  document.body.append(modal);
});

showUsers();
