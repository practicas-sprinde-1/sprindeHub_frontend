import { setClient } from "../api/client.api.js";
import { createHeader } from "../components/header.js";

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
      window.location.href = "../index.html";
    } catch (error) {
      alert("No se ha podido guardar el cliente");
    }
  });
}
