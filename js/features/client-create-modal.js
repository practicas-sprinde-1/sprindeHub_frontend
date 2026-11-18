import { setClient } from "../api/client.api.js";
import { showNotification } from "../components/notifications.js";

export function openNewClientModal(onSaveSuccess) {
  if (document.querySelector(".modal-overlay, dialog[open]")) {
    return;
  }

  const modal = createNewClientModal(onSaveSuccess);
  document.body.append(modal);
  modal.querySelector("input");
}

export function createNewClientModal(onSaveSuccess) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("client-create-modal");

  const closeModal = () => {
    overlay.remove();
  };

  const title = document.createElement("h1");
  title.id = "new-client-title";
  title.classList.add("modal-title");
  title.textContent = "Nuevo cliente";

  modal.append(
    createCloseButton(closeModal),
    title,
    createClientForm(closeModal, onSaveSuccess),
  );
  overlay.append(modal);
  return overlay;
}

function createClientForm(closeModal, onSaveSuccess) {
  const form = document.createElement("form");
  form.classList.add("client-create-form");
  form.noValidate = true;

  const nameInput = createRequiredInput("text", "name");
  const cifInput = createRequiredInput("text", "cif");
  const phoneInput = createRequiredInput("tel", "phone");

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.classList.add("modal-save-button");
  saveButton.textContent = "Guardar";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.classList.add("modal-cancel-button");
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", closeModal);

  const actions = document.createElement("div");
  actions.classList.add("modal-actions");
  actions.append(saveButton, cancelButton);

  form.append(
    createField("Nombre del cliente", nameInput),
    createField("CIF", cifInput),
    createField("Teléfono", phoneInput),
    actions,
  );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitNewClient({
      form,
      inputs: { nameInput, cifInput, phoneInput },
      saveButton,
      closeModal,
      onSaveSuccess,
    });
  });

  return form;
}

function createRequiredInput(type, name) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.id = `new-client-${name}`;
  input.required = true;

  return input;
}

function createField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("client-create-field");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.id;

  field.append(label, input);
  return field;
}

function createCloseButton(onClose) {
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("modal-close-button");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", onClose);

  return closeButton;
}

async function submitNewClient({
  form,
  inputs,
  saveButton,
  closeModal,
  onSaveSuccess,
}) {
  if (saveButton.disabled || !validateRequiredFields(inputs)) {
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const newClient = {
    name: inputs.nameInput.value.trim(),
    cif: inputs.cifInput.value.trim(),
    phone: inputs.phoneInput.value.trim(),
    is_active: true,
  };

  try {
    saveButton.disabled = true;
    await setClient(newClient);
    await onSaveSuccess();
    closeModal();
    showNotification({
      type: "success",
      title: "Cliente creado",
      message: `Se ha creado el cliente ${newClient.name}.`,
    });
  } catch (error) {
    showNotification({
      type: "error",
      title: "No se pudo guardar el cliente",
      message: error.message || "Ha ocurrido un error inesperado.",
      duration: 7000,
    });
  }
}

function validateRequiredFields(inputs) {
  for (const input of Object.values(inputs)) {
    if (input.value.trim() === "") {
      showNotification({
        type: "warning",
        title: "Campos obligatorios",
        message: "Completa todos los campos antes de guardar el cliente.",
      });
      input.focus();
      return false;
    }
  }

  return true;
}
