import { logout } from "../api/session.js";

export function createHeader(userName, profileUrl) {
  const header = document.createElement("header");
  header.classList.add("main-header");

  const profileLink = document.createElement("a");
  profileLink.classList.add("main-header-profile");
  profileLink.href = profileUrl;
  profileLink.textContent = userName;

  const logoutButton = document.createElement("button");
  logoutButton.classList.add("main-header-logout");
  logoutButton.type = "button";
  logoutButton.textContent = "Salir";

  logoutButton.addEventListener("click", () => {
    logout();
  });

  header.appendChild(profileLink);
  header.appendChild(logoutButton);

  return header;
}
