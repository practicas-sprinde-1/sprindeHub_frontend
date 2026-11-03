import { logout } from "../api/session.js";

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

export function createHeader(userName, profileUrl) {
  const header = document.createElement("header");
  header.classList.add("main-header");

  const profileLink = document.createElement("a");
  profileLink.classList.add("main-header-profile");
  profileLink.href = profileUrl;
  profileLink.textContent = userName;

  const actionButtons = document.createElement("div");
  actionButtons.classList.add("main-header-actions");
  actionButtons.append(
    ...createNavigationButtons(profileUrl),
    createLogoutButton(),
    createThemeButton(),
  );

  header.append(profileLink, actionButtons);
  return header;
}

function createLogoutButton() {
  const logoutButton = document.createElement("button");
  logoutButton.classList.add("main-header-logout");
  logoutButton.type = "button";
  logoutButton.textContent = "Salir";

  logoutButton.addEventListener("click", () => {
    logout();
  });

  return logoutButton;
}

function createThemeButton() {
  const themeButton = document.createElement("button");
  themeButton.classList.add("main-header-theme");
  themeButton.id = "theme-toggle";
  themeButton.type = "button";
  themeButton.textContent = "Modo oscuro";

  if (document.body.classList.contains("dark-mode")) {
    themeButton.textContent = "Modo claro";
  }

  themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      themeButton.textContent = "Modo claro";
      return;
    }

    localStorage.setItem("theme", "light");
    themeButton.textContent = "Modo oscuro";
  });

  return themeButton;
}

function createNavigationButtons(profileUrl) {
  const navigationItems = [
    { className: "main-header-projects", label: "Proyectos", pageName: "index.html" },
    { className: "main-header-clients", label: "Clientes", pageName: "clients.html" },
    { className: "main-header-users", label: "Usuarios", pageName: "users.html" },
    { className: "main-header-logs", label: "Registros", pageName: "logs.html" },
  ];

  return navigationItems.map(({ className, label, pageName }) => {
    const navigationButton = document.createElement("button");
    navigationButton.classList.add(className);
    navigationButton.type = "button";
    navigationButton.textContent = label;
    navigationButton.addEventListener("click", () => {
      window.location.href = getPageUrl(profileUrl, pageName);
    });
    return navigationButton;
  });
}

function getPageUrl(profileUrl, pageName) {
  const isRootPage = profileUrl.startsWith("./pages/");

  if (pageName === "index.html") {
    return isRootPage ? "./index.html" : "../index.html";
  }

  return isRootPage ? `./pages/${pageName}` : `./${pageName}`;
}
