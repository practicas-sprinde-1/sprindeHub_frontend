import { createHeader } from "../components/header.js";
import { userMockData } from "../mockdata/user.mockdata.js";
import { projectsMockData } from "../mockdata/projects.mockdata.js";
import { createEditProfileModal } from "../components/edit-profile-modal.js";

const headerContainer = document.querySelector("#header-container");
headerContainer.append(createHeader("César", "./profile.html"));

const user = userMockData;

function renderUser(user) {
  document.title = `${user.username} - Sprinde`;

  document.querySelector("#user-title").textContent = user.email;

  const projectsList = document.querySelector("#user-list-projects");
  projectsList.replaceChildren();

  const projects = projectsMockData.items;

  projects.forEach((project) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");

    link.href = `./project.html?id=${project.id}`;
    link.textContent = project.name;

    listItem.append(link);

    projectsList.append(listItem);
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
