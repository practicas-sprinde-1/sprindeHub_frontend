import { createHeader } from "../components/header.js";

start();

function start() {
  const headerContainer = document.querySelector("#header-container");
  headerContainer.append(createHeader("César", "./profile.html"));

  const clientForm = document.querySelector("#client-form");
  configureClientForm(clientForm);
}

export function configureClientForm(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const clientData = {
      name: form.elements.name.value.trim(),
      cif: form.elements.cif.value.trim(),
      phone: form.elements.phone.value.trim(),
      is_active: form.elements["is-active"].value === "true",
    };

    console.log("Datos del cliente preparados:", clientData);

    // Aquí irá POST /clients con clientData.
    // Después de guardar correctamente:
    // window.location.href = "../index.html";
  });
}
