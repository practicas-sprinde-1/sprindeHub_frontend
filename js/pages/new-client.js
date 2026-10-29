import { setClient } from "../api/client.api.js";
import { createHeader } from "../components/header.js";
import { showNotification } from "../components/notifications.js";

start();

function start() {
  const headerContainer = document.querySelector("#header-container");
  headerContainer.append(createHeader("César", "./profile.html"));

  const clientForm = document.querySelector("#client-form");
  configureClientForm(clientForm);
}

export function configureClientForm(form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const clientData = {
      name: form.elements.name.value.trim(),
      cif: form.elements.cif.value.trim(),
      phone: form.elements.phone.value.trim(),
      is_active: true,
    };

    try {
      await setClient(clientData);
      window.location.href = "./clients.html";
    } catch (error) {
      showNotification({
        type: "error",
        title: "No se pudo guardar el cliente",
        message: error.message,
        duration: 7000,
      });
    }
  });
}
