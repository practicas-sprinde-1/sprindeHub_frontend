import { setClient } from "../api/client.api.js";
import { createHeader } from "../components/header.js";
import { showNotification } from "../components/notifications.js";

startPage();

function startPage() {
  renderHeader();

  const clientForm = document.querySelector("#client-form");
  configureClientForm(clientForm);
}

export function configureClientForm(form) {
  form.addEventListener("submit", (event) => handleFormSubmit(event, form));
}

function renderHeader() {
  const cachedUser = getCachedUser();
  const header = createHeader(cachedUser.username, "./profile.html");

  document.querySelector("#header-container").append(header);
}

function getCachedUser() {
  const serializedUser = sessionStorage.getItem("userInfo");

  if (!serializedUser) return undefined;

  return JSON.parse(serializedUser);
}

async function handleFormSubmit(event, form) {
  event.preventDefault();

  const clientData = buildClientData(form);

  try {
    await setClient(clientData);
    window.location.href = "./clients.html";
  } catch (error) {
    notifyClientSaveError(error);
  }
}

function buildClientData(form) {
  return {
    name: form.elements.name.value.trim(),
    cif: form.elements.cif.value.trim(),
    phone: form.elements.phone.value.trim(),
    is_active: true,
  };
}

function notifyClientSaveError(error) {
  showNotification({
    type: "error",
    title: "No se pudo guardar el cliente",
    message: error.message,
    duration: 7000,
  });
}
