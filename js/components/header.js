import { expireSession } from "../api/methods.js";

const DARK_MODE_CLASS = "dark-mode";
const THEME_STORAGE_KEY = "theme";
const DARK_THEME = "dark";
const LIGHT_THEME = "light";

const NAVIGATION_ITEMS = [
  {
    className: "main-header-projects",
    label: "Proyectos",
    pageName: "index.html",
  },
  {
    className: "main-header-clients",
    label: "Clientes",
    pageName: "clients.html",
  },
  {
    className: "main-header-tags",
    label: "Dispositivos",
    pageName: "tags.html",
  },
  { className: "main-header-users", label: "Usuarios", pageName: "users.html" },
  { className: "main-header-logs", label: "Registros", pageName: "logs.html" },
];

loadTheme();

export function createHeader(userName, profileUrl) {
  const header = document.createElement("header");
  header.classList.add("main-header");
  header.append(
    createProfileLink(userName, profileUrl),
    createHeaderActions(profileUrl),
  );

  return header;
}

function loadTheme() {
  if (localStorage.getItem(THEME_STORAGE_KEY) !== DARK_THEME) {
    return;
  }

  document.body.classList.add(DARK_MODE_CLASS);
}

function createProfileLink(userName, profileUrl) {
  const profileLink = document.createElement("a");
  profileLink.classList.add("main-header-profile");
  profileLink.href = profileUrl;
  profileLink.textContent = userName;

  return profileLink;
}

function createHeaderActions(profileUrl) {
  const actionContainer = document.createElement("div");
  actionContainer.classList.add("main-header-actions");
  actionContainer.append(
    ...createNavigationButtons(profileUrl),
    createLogoutButton(),
    createThemeButton(),
  );

  return actionContainer;
}

function createNavigationButtons(profileUrl) {
  return NAVIGATION_ITEMS.map(({ className, label, pageName }) => {
    const navigationButton = createButton(className, label);
    navigationButton.addEventListener("click", () => {
      window.location.href = getPageUrl(profileUrl, pageName);
    });

    return navigationButton;
  });
}

function createLogoutButton() {
  const logoutButton = createButton("main-header-logout", "Salir");
  logoutButton.addEventListener("click", expireSession);

  return logoutButton;
}

function createThemeButton() {
  const themeButton = createButton("main-header-theme", getThemeButtonLabel());
  themeButton.id = "theme-toggle";
  themeButton.addEventListener("click", () => changeTheme(themeButton));

  return themeButton;
}

function createButton(className, label) {
  const button = document.createElement("button");
  button.classList.add(className);
  button.type = "button";
  button.textContent = label;

  return button;
}

function changeTheme(themeButton) {
  const isDarkModeEnabled = document.body.classList.toggle(DARK_MODE_CLASS);
  const selectedTheme = isDarkModeEnabled ? DARK_THEME : LIGHT_THEME;

  localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
  themeButton.textContent = getThemeButtonLabel();
}

function getThemeButtonLabel() {
  return document.body.classList.contains(DARK_MODE_CLASS)
    ? "Modo claro"
    : "Modo oscuro";
}

function getPageUrl(profileUrl, pageName) {
  const isPagesRoute = profileUrl.startsWith("./pages/");

  if (pageName === "index.html") {
    return isPagesRoute ? "./index.html" : "../index.html";
  }

  return isPagesRoute ? `./pages/${pageName}` : `./${pageName}`;
}
