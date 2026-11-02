import { logout } from "../api/session.js";

// Comprueba la preferencia guardada antes de renderizar el encabezado.
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

  const logoutButton = document.createElement("button");
  logoutButton.classList.add("main-header-logout");
  logoutButton.type = "button";
  logoutButton.textContent = "Salir";

  logoutButton.addEventListener("click", () => {
    logout();
  });

  const themeButton = document.createElement("button");
  themeButton.classList.add("main-header-theme");
  themeButton.id = "theme-toggle";
  themeButton.type = "button";
  themeButton.textContent = "Modo oscuro";

  const projectButton = document.createElement("button");
  projectButton.classList.add("main-header-projects");
  projectButton.type = "button";
  projectButton.textContent = "Proyectos";

  projectButton.addEventListener("click", () => {
    window.location.href = getPageUrl(profileUrl, "index.html");
  });

  const clientButton = document.createElement("button");
  clientButton.classList.add("main-header-clients");
  clientButton.type = "button";
  clientButton.textContent = "Clientes";

  clientButton.addEventListener("click", () => {
    window.location.href = getPageUrl(profileUrl, "clients.html");
  });

  const usersButton = document.createElement("button");
  usersButton.classList.add("main-header-users");
  usersButton.type = "button";
  usersButton.textContent = "Usuarios";

  usersButton.addEventListener("click", () => {
    window.location.href = getPageUrl(profileUrl, "users.html");
  });

  const logsButton = document.createElement("button");
  logsButton.classList.add("main-header-logs");
  logsButton.type = "button";
  logsButton.textContent = "Registros";

  logsButton.addEventListener("click", () => {
    window.location.href = getPageUrl(profileUrl, "logs.html");
  });

  const actionButtons = document.createElement("div");
  actionButtons.classList.add("main-header-actions");

  actionButtons.append(projectButton, clientButton);

  actionButtons.append(usersButton, logsButton, logoutButton, themeButton);

  if (document.body.classList.contains("dark-mode")) {
    themeButton.textContent = "Modo claro";
  }

  themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      themeButton.textContent = "Modo claro";
    } else {
      localStorage.setItem("theme", "light");
      themeButton.textContent = "Modo oscuro";
    }
  });

  header.appendChild(profileLink);
  header.appendChild(actionButtons);
  return header;
}

function getPageUrl(profileUrl, pageName) {
  // Las rutas cambian según si la página actual está en la raíz o en /pages.
  if (profileUrl.startsWith("./pages/")) {
    if (pageName === "index.html") {
      return "./index.html";
    }

    return `./pages/${pageName}`;
  }

  if (pageName === "index.html") {
    return "../index.html";
  }

  return `./${pageName}`;
}
