import { modifyClient } from "../api/client.api.js";

export function createEditModalClient(client, onSave) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("client-edit-modal");

  const title = document.createElement("h1");
  title.textContent = `Editando cliente: ${client.name}`;
  title.classList.add("modal-title");

  const closeButton = document.createElement("button");
  closeButton.classList.add("modal-close-button");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Cerrar");

  closeButton.addEventListener("click", () => {
    overlay.remove();
  });

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "name";
  nameInput.value = client.name;

  const cifInput = document.createElement("input");
  cifInput.type = "text";
  cifInput.name = "cif";
  cifInput.value = client.cif;

  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.name = "phone";
  phoneInput.value = client.phone;

  const statusInput = document.createElement("select");
  statusInput.name = "is_active";

  const activeOption = document.createElement("option");
  activeOption.value = "true";
  activeOption.textContent = "Activo";

  const inactiveOption = document.createElement("option");
  inactiveOption.value = "false";
  inactiveOption.textContent = "Inactivo";

  statusInput.append(activeOption, inactiveOption);
  statusInput.value = String(client.is_active);

  const nameField = createClientField("Nombre", nameInput);
  const cifField = createClientField("CIF", cifInput);
  const phoneField = createClientField("Teléfono", phoneInput);
  const statusField = createClientField("Estado", statusInput);

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  saveButton.addEventListener("click", async () => {
    client.name = nameInput.value.trim();
    client.cif = cifInput.value.trim();
    client.phone = phoneInput.value.trim();
    client.is_active = statusInput.value === "true";

    await modifyClient(client, client.id);

    await onSave(client);
    overlay.remove();
  });

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";
  cancelButton.classList.add("modal-cancel-button");

  cancelButton.addEventListener("click", () => {
    overlay.remove();
  });

  const modalActions = document.createElement("div");
  modalActions.classList.add("modal-actions");
  modalActions.append(saveButton, cancelButton);

  modal.append(
    closeButton,
    title,
    nameField,
    cifField,
    phoneField,
    statusField,
    modalActions,
  );

  overlay.append(modal);
  return overlay;
}

function createClientField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("client-edit-field");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.name;
  input.id = input.name;

  field.append(label, input);
  return field;
}
