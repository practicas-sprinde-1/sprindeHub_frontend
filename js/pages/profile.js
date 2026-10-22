import { createHeader } from "../components/header.js";
import { createEditProfileModal } from "../components/profile-edit-modal.js";
import { clientsMockData } from "../mockdata/client.mockdata.js";
import { getProfile } from "../api/profile.api.js";

const headerContainer = document.querySelector("#header-container");
headerContainer.append(createHeader("César", "./profile.html"));

const user = await getProfile();

function renderUser(user) {
  document.title = `${user.username} - Sprinde`;

  document.querySelector("#user-title").textContent = user.email;

  const clientsList = document.querySelector("#user-list-clients");
  clientsList.replaceChildren();

  const clients = clientsMockData; //LLAMADA A USER_CLIENT PARA SABER QUÉ CLIENTES TIENE ASIGNADO.

  clients.forEach((client) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");

    link.href = `./client.html?id=${client.id}`;
    link.textContent = client.name;

    listItem.append(link);

    clientsList.append(listItem);
  });

  document.querySelector("#user-email").textContent = user.email;
  document.querySelector("#user-name").textContent = user.username;
  document.querySelector("#user-role").textContent = user.role;
}

renderUser(user);

const editProfileButton = document.querySelector(".button-edit-user");

editProfileButton.addEventListener("click", () => {
  if (document.querySelector(".modal-overlay")) {
    return;
  }

  const modal = createEditProfileModal(user, renderUser);
  document.body.append(modal);
});
