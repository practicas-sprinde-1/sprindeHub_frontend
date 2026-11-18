import { modifyTag } from "../api/tag.api.js";
import {
  createDeviceEditorFields,
  getDeviceChanges,
} from "../components/device-form.js";
import { showNotification } from "../components/notifications.js";

export function createEditTagModal(tag, refreshTable) {
  const dialog = document.createElement("dialog");
  dialog.classList.add("tag-modal", "tag-edit-modal");

  const title = document.createElement("h2");
  title.id = "edit-tag-title";
  title.textContent = "Modificar dispositivo";

  const clientInfo = document.createElement("p");
  clientInfo.classList.add("tag-edit-client");
  clientInfo.textContent = `Cliente: ${tag.client?.name || "Sin información"}`;

  const description = document.createElement("p");
  description.textContent = "Los campos con * son obligatorios.";

  const form = document.createElement("form");
  form.classList.add("tag-form");
  const formFields = document.createElement("fieldset");
  formFields.classList.add("tag-form-fields");
  const { inputs, inputElements } = createDeviceEditorFields(tag, "tag-form-field");
  inputs.device_type.autofocus = true;
  formFields.append(...inputElements);

  const statusMessage = document.createElement("p");
  statusMessage.hidden = true;

  const closeButton = createButton("×", "tag-close-button");
  const saveButton = createButton("Guardar");
  saveButton.type = "submit";
  const cancelButton = createButton("Cancelar", "tag-cancel-button");
  const actions = document.createElement("div");
  actions.classList.add("tag-modal-actions");
  actions.append(cancelButton, saveButton);

  const modal = {
    dialog,
    formFields,
    inputs,
    statusMessage,
    closeButton,
    saveButton,
    cancelButton,
    isSaving: false,
  };

  closeButton.addEventListener("click", () => dialog.close());
  cancelButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove());
  dialog.addEventListener("cancel", (event) => {
    if (modal.isSaving) event.preventDefault();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveTagChanges(tag, modal, refreshTable);
  });

  form.append(formFields, statusMessage, actions);
  dialog.append(closeButton, title, clientInfo, description, form);
  return dialog;
}

async function saveTagChanges(tag, modal, refreshTable) {
  if (modal.isSaving) return;

  modal.statusMessage.hidden = true;
  setSavingState(modal, true);
  try {
    const changes = getDeviceChanges(modal.inputs);
    const savedTag = await modifyTag(changes, tag.id);
    Object.assign(tag, savedTag);
  } catch (error) {
    modal.statusMessage.textContent = error.message;
    modal.statusMessage.hidden = false;
    return;
  } finally {
    setSavingState(modal, false);
  }

  modal.dialog.close();
  showNotification({
    type: "success",
    title: "Dispositivo modificado",
    message: "Los cambios se han guardado correctamente.",
  });
  await refreshTable();
}

function setSavingState(modal, isSaving) {
  modal.isSaving = isSaving;
  modal.formFields.disabled = isSaving;
  modal.saveButton.disabled = isSaving;
  modal.closeButton.disabled = isSaving;
  modal.cancelButton.disabled = isSaving;
  modal.saveButton.textContent = isSaving ? "Guardando..." : "Guardar";
}

function createButton(text, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  if (className) button.classList.add(className);
  return button;
}
